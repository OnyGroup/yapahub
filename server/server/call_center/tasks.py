from celery import shared_task
from django.db import OperationalError, transaction, DatabaseError
import time
from .models import CallLog, QueuedCall
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging
from random import uniform
import os
from django.conf import settings

logger = logging.getLogger(__name__)

@shared_task(
    bind=True,
    max_retries=5,
    autoretry_for=(OperationalError, DatabaseError),
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
    acks_late=True  # Don't acknowledge task until it's actually done
)
def update_call_log(self, session_id, defaults):
    """
    Enhanced Celery task for handling call log updates with:
    - Atomic transactions
    - Smart retry with exponential backoff
    - Comprehensive error handling
    - Deadlock prevention
    """
    try:
        # Start timing for performance monitoring
        start_time = time.monotonic()
        
        logger.info(f"Processing call log update for session {session_id}")
        
        # Use atomic transaction to ensure all operations complete together
        with transaction.atomic():
            # Use select_for_update with nowait to prevent deadlocks
            call_log, created = CallLog.objects.select_for_update(nowait=True).update_or_create(
                session_id=session_id,
                defaults=defaults
            )
            
            # Process completed calls
            if defaults.get('status') in ['completed', 'failed', 'busy', 'no-answer']:
                call_log.end_time = timezone.now()
                if not call_log.duration and call_log.start_time:
                    call_log.duration = (call_log.end_time - call_log.start_time).seconds
                call_log.save()

                # Clean up queued calls if inbound
                if defaults.get('direction') == 'inbound':
                    QueuedCall.objects.filter(session_id=session_id).delete()
            
            # Log successful processing
            duration = time.monotonic() - start_time
            logger.info(
                f"Successfully processed call log for session {session_id} "
                f"(status: {defaults.get('status')}) in {duration:.2f}s"
            )
            
            return call_log.id

    except (OperationalError, DatabaseError) as exc:
        current_retry = self.request.retries
        max_retries = self.max_retries
        
        # Calculate wait time with exponential backoff and jitter
        base_wait = min(2 ** current_retry, 30)  # Cap at 30 seconds
        jitter = uniform(0, 0.5)  # Add random jitter up to 0.5 seconds
        wait_time = base_wait + jitter
        
        logger.warning(
            f"Database error (Attempt {current_retry + 1}/{max_retries}). "
            f"Retrying in {wait_time:.2f} seconds. Session: {session_id}. "
            f"Error: {str(exc)}"
        )
        
        # Retry with calculated wait time
        raise self.retry(exc=exc, countdown=wait_time)

    except Exception as exc:
        # Log unexpected errors but don't retry
        logger.error(
            f"Unexpected error processing call log for session {session_id}: {str(exc)}",
            exc_info=True,
            extra={'session_id': session_id, 'defaults': defaults}
        )
        # Notify administrators via error channel
        async_to_sync(get_channel_layer().group_send)(
            'errors',
            {
                'type': 'task.error',
                'session_id': session_id,
                'error': str(exc)
            }
        )
        raise

@shared_task(
    bind=True,
    max_retries=3,
    retry_backoff=10,
    retry_jitter=True
)
def cleanup_sqlite_locks(self):
    """
    Enhanced periodic task to clean up SQLite lock files with:
    - Better error handling
    - State verification
    - Retry mechanism
    """
    try:
        from django.db import connection
        
        if 'sqlite3' not in connection.settings_dict['ENGINE']:
            logger.info("Skipping SQLite lock cleanup (not using SQLite)")
            return

        db_path = connection.settings_dict['NAME']
        lock_files = [f"{db_path}{suffix}" for suffix in ['-wal', '-shm']]
        
        logger.info("Starting SQLite lock cleanup")
        
        cleaned = 0
        for lock_file in lock_files:
            try:
                if os.path.exists(lock_file):
                    os.remove(lock_file)
                    cleaned += 1
                    logger.debug(f"Removed lock file: {lock_file}")
            except Exception as e:
                logger.warning(
                    f"Failed to remove lock file {lock_file}: {str(e)}",
                    exc_info=True
                )
                # Retry individual file failures
                raise self.retry(exc=e)

        logger.info(f"SQLite lock cleanup completed. Removed {cleaned} lock files.")
        return cleaned

    except Exception as exc:
        logger.error(
            "Failed to complete SQLite lock cleanup",
            exc_info=True
        )
        raise self.retry(exc=exc)