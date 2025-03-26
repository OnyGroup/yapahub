import React from 'react';
import CallManager from './CallManager';
import IncomingCallManager from './IncomingCallManager';

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Call Desk</h1>
      <CallManager />
      <IncomingCallManager />
    </div>
  );
};

export default HomePage;