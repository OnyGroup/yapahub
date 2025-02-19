import cloudinary.uploader
from decouple import config

def upload_image_to_cloudinary(image_file):
    """
    Uploads an image file to Cloudinary and returns the URL.
    """
    try:
        # Upload the image to Cloudinary
        result = cloudinary.uploader.upload(image_file)
        return result['secure_url']  # Return the URL of the uploaded image
    except Exception as e:
        print(f"Error uploading image to Cloudinary: {e}")
        return None