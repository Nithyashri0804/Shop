import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Instagram, MessageCircle, Mail } from 'lucide-react';

const SimpleLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">AS</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            AS Shreads
          </h1>
        </div>

        {/* Welcome Message */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl text-gray-700 mb-6 font-light">
            Welcome to Your Style Destination
          </h2>
          <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
            Discover the latest fashion trends and express your unique style with our curated collection of premium clothing and accessories.
          </p>
        </div>

        {/* Start Shopping Button */}
        <div className="mb-12">
          <Link
            to="/products"
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ShoppingBag className="mr-3" size={24} />
            Start Shopping
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white p-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
          >
            <Instagram 
              size={24} 
              className="text-gray-600 group-hover:text-pink-500 transition-colors" 
            />
          </a>
          
          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white p-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
          >
            <MessageCircle 
              size={24} 
              className="text-gray-600 group-hover:text-green-500 transition-colors" 
            />
          </a>
          
          <a
            href="mailto:contact@fashionhub.com"
            className="group bg-white p-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
          >
            <Mail 
              size={24} 
              className="text-gray-600 group-hover:text-blue-500 transition-colors" 
            />
          </a>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-pink-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-5 w-12 h-12 bg-purple-300 rounded-full opacity-15 animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default SimpleLanding;

