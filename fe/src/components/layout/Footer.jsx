import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8 border-t-2 border-gray-300">
      <div className="container mx-auto px-6 flex flex-col items-center justify-center">
        {/* Website logo and name */}
        <div className="text-blue-500 text-lg font-semibold mb-6">
          Website logo and name here
        </div>

        {/* Navigation Links on one row */}
        <div className="flex space-x-6 mb-6 sm:mb-0 flex-wrap justify-center sm:justify-start">
          <a href="#" className="text-gray-600 hover:text-blue-500">Home</a>
          <a href="#" className="text-gray-600 hover:text-blue-500">About</a>
          <a href="#" className="text-gray-600 hover:text-blue-500">News</a>
          <a href="#" className="text-gray-600 hover:text-blue-500">Contact Us</a>
        </div>

        {/* Contact Info on one row */}
        <div className="flex space-x-6 items-center mb-6 sm:mb-0 text-gray-600 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v6m0 0l3-3m-3 3l-3-3" />
            </svg>
            <span>8819 Ohio St. South Gate, CA 90280</span>
          </div>

          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10l-2 2m0 0l-2-2m2 2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <a href="mailto:Ourstudio@hello.com">Ourstudio@hello.com</a>
          </div>

          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12l-6 6-6-6" />
            </svg>
            <a href="tel:+13866883295">+1 386-688-3295</a>
          </div>
        </div>

        {/* Copyright Text on one row */}
        <div className="text-center text-gray-500">
          Copyright Satyam Studio
        </div>
      </div>
    </footer>
  );
};

export default Footer;
