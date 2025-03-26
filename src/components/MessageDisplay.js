import React from 'react';

const MessageDisplay = ({ error, success }) => {
  return (
    <>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </>
  );
};

export default MessageDisplay;