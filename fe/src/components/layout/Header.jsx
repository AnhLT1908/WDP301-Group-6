import React, { useState } from 'react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header>
      <div className="bg-green-400 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center text-white">
            <div className="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6H6V4h12v2h2v12h-2v2H6v-2H4V6z"
                />
              </svg>
            </div>
            <span className="font-bold text-xl">Lodging Chain Management</span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              className="px-4 py-2 rounded-full bg-white text-gray-700 placeholder-gray-500"
              placeholder="Search here ..."
            />
            <button className="p-2 bg-yellow-400 rounded-full text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 4a7 7 0 11-7 7 7 7 0 017-7zM4 11l5 5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-green-600 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <nav className="hidden md:flex space-x-6 text-white">
            <a href="/" className="hover:text-yellow-400">Home</a>
            <a href="/about" className="hover:text-yellow-400">About Us</a>
            <a href="/features" className="hover:text-yellow-400">Features</a>
            <a href="/categories" className="hover:text-yellow-400">Categories</a>
            <a href="/contact" className="hover:text-yellow-400">Contact</a>
          </nav>

          <button className="text-white hover:text-yellow-400">Sign In</button>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-green-600 text-white p-4 space-y-4">
          <a href="/" className="block">Home</a>
          <a href="/about" className="block">About Us</a>
          <a href="/features" className="block">Features</a>
          <a href="/categories" className="block">Categories</a>
          <a href="/contact" className="block">Contact</a>
        </div>
      )}
    </header>
  );
}

export default Header;
