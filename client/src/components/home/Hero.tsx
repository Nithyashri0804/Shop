import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, TrendingUp } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Discover Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Perfect Style
              </span>
            </h1>
            <p className="text-xl text-purple-100 max-w-lg">
              Explore our curated collection of premium fashion for every occasion. From casual to formal, we've got you covered.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/women"
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <ShoppingBag size={20} />
                <span>Shop Women</span>
              </Link>
              <Link
                to="/men"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <TrendingUp size={20} />
                <span>Shop Men</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-purple-200">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-purple-200">Products</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Star size={20} className="text-yellow-400 fill-current" />
                  <span className="text-3xl font-bold">4.9</span>
                </div>
                <div className="text-purple-200">Rating</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Fashion Model"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              
              {/* Floating Cards */}
              <div className="absolute -top-6 -left-6 bg-white text-gray-800 p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">New Collection</span>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-white text-gray-800 p-4 rounded-lg shadow-lg">
                <div className="text-lg font-bold">50% OFF</div>
                <div className="text-sm text-gray-600">Limited Time</div>
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-700 rounded-2xl transform rotate-6 opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;