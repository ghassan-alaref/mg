import React from 'react';
import SkyTechLogo from '../Images/SkyTech_logo.png';

const Footer = () => {

 


    
  return (
 
  <footer className="p-5">
  <div className="flex  justify-center md:justify-between items-center text-center text-sm text-gray-500 px-0 md:px-10 mb-14  md:mb-5 gap-3 md:gap-0 ">
    <span>© 2025 - SkyTech</span>
    <img src={SkyTechLogo} alt="Your Image Description" className="w-16 h-auto mr-0 md:mr-5 xl:mr-0" /> 
  </div>
</footer>
 
  );
};

export default Footer;
