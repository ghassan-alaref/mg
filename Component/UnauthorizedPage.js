import React from 'react';
import Error from '../Images/error2.png';

const UnauthorizedPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
        <img src={Error} alt="Error" className="w-1/3 h-auto mx-auto" />
    </div>
  );
};

export default UnauthorizedPage;
