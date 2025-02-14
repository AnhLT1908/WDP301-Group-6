import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-green-600 text-white p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold">Company</h3>
          <ul>
            <li><a href="/about" className="hover:text-gray-300">About Us</a></li>
            <li><a href="/contact" className="hover:text-gray-300">Contact</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Follow Us On</h3>
          <ul>
            <li><a href="/" className="hover:text-gray-300">Facebook</a></li>
            <li><a href="/" className="hover:text-gray-300">Twitter</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-6 text-center">
        <p>&copy; 2023 All Rights Reserved</p>
      </div>
    </footer>
  );
}

export default Footer;