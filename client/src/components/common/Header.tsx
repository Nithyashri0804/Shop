import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();
  const navigate = useNavigate();

  // Debug cart state in header
  useEffect(() => {
    console.log('Header - Cart total items:', totalItems);
  }, [totalItems]);

  // Refs for click outside detection
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
      setIsSearchOpen(false);
      setIsUserMenuOpen(false);
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle ESC key to close menus
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Handle keyboard navigation for accessibility
  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 z-10" onClick={handleLinkClick}>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs lg:text-sm">AS</span>
            </div>
            <span className="text-lg lg:text-xl font-bold text-gray-800 hidden sm:block">AS Shreads</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/products/women" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Women
            </Link>
            <Link to="/products/men" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Men
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Categories
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 lg:p-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-200 touch-manipulation"
                aria-label="Search"
                onKeyDown={(e) => handleKeyDown(e, () => setIsSearchOpen(!isSearchOpen))}
                tabIndex={0}
              >
                <Search size={20} />
              </button>
              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 lg:w-80 bg-white rounded-lg shadow-lg border p-2 transform transition-all duration-200 ease-out animate-in slide-in-from-top-2">
                  <form onSubmit={handleSearch}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-base"
                      autoFocus
                    />
                  </form>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="p-2 lg:p-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-200 relative touch-manipulation"
              aria-label={`Wishlist (${wishlistItems} items)`}
              onClick={handleLinkClick}
            >
              <Heart size={20} />
              {wishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 font-medium animate-pulse">
                  {wishlistItems}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="p-2 lg:p-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-200 relative touch-manipulation"
              aria-label={`Cart (${totalItems} items)`}
              onClick={handleLinkClick}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 font-medium">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 lg:p-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-200 touch-manipulation"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                  onKeyDown={(e) => handleKeyDown(e, () => setIsUserMenuOpen(!isUserMenuOpen))}
                  tabIndex={0}
                >
                  <User size={20} />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border transform transition-all duration-200 ease-out animate-in slide-in-from-top-2">
                    <div className="p-3 border-b">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <nav className="py-2">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
                        onClick={handleLinkClick}
                      >
                        Profile
                      </Link>
                      <Link 
                        to="/orders" 
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
                        onClick={handleLinkClick}
                      >
                        Orders
                      </Link>
                      {user.role === 'admin' && (
                        <>
                          <Link 
                            to="/admin" 
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
                            onClick={handleLinkClick}
                          >
                            Admin Dashboard
                          </Link>
                          <Link 
                            to="/admin/categories" 
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
                            onClick={handleLinkClick}
                          >
                            Manage Categories
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
                      >
                        Logout
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium text-sm lg:text-base touch-manipulation"
                onClick={handleLinkClick}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center space-x-1">
            {/* Mobile Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Search"
              onKeyDown={(e) => handleKeyDown(e, () => setIsSearchOpen(!isSearchOpen))}
              tabIndex={0}
            >
              <Search size={20} />
            </button>

            {/* Mobile Cart */}
            <Link 
              to="/cart" 
              className="p-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-200 relative touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={`Cart (${totalItems} items)`}
              onClick={handleLinkClick}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 font-medium">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Menu"
              aria-expanded={isMenuOpen}
              onKeyDown={(e) => handleKeyDown(e, () => setIsMenuOpen(!isMenuOpen))}
              tabIndex={0}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden py-4 border-t animate-in slide-in-from-top-2" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-base touch-manipulation"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-in fade-in duration-200" 
          onClick={() => setIsMenuOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setIsMenuOpen(false)}
          tabIndex={-1}
        />
      )}

      {/* Mobile Menu */}
      <div 
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-gray-800">FashionHub</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-200 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close menu"
              onKeyDown={(e) => handleKeyDown(e, () => setIsMenuOpen(false))}
              tabIndex={0}
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-1">
              <Link 
                to="/products/women" 
                className="flex items-center py-4 px-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium touch-manipulation text-base"
                onClick={handleLinkClick}
              >
                Women
              </Link>
              <Link 
                to="/products/men" 
                className="flex items-center py-4 px-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium touch-manipulation text-base"
                onClick={handleLinkClick}
              >
                Men
              </Link>
              <Link 
                to="/products" 
                className="flex items-center py-4 px-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium touch-manipulation text-base"
                onClick={handleLinkClick}
              >
                Categories
              </Link>
              <Link 
                to="/about" 
                className="flex items-center py-4 px-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium touch-manipulation text-base"
                onClick={handleLinkClick}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="flex items-center py-4 px-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium touch-manipulation text-base"
                onClick={handleLinkClick}
              >
                Contact
              </Link>
            </nav>

            <div className="border-t p-4 space-y-1">
              <Link 
                to="/wishlist" 
                className="flex items-center justify-between py-4 px-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium touch-manipulation text-base"
                onClick={handleLinkClick}
              >
                <div className="flex items-center space-x-3">
                  <Heart size={20} />
                  <span>Wishlist</span>
                </div>
                {wishlistItems > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 font-medium animate-pulse">
                    {wishlistItems}
                  </span>
                )}
              </Link>
            </div>

            {user ? (
              <div className="border-t p-4 space-y-1">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Link 
                  to="/profile" 
                  className="flex items-center py-4 px-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium touch-manipulation text-base"
                  onClick={handleLinkClick}
                >
                  Profile
                </Link>
                <Link 
                  to="/orders" 
                  className="flex items-center py-4 px-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium touch-manipulation text-base"
                  onClick={handleLinkClick}
                >
                  Orders
                </Link>
                {user.role === 'admin' && (
                  <>
                    <Link 
                      to="/admin" 
                      className="flex items-center py-4 px-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium touch-manipulation text-base"
                      onClick={handleLinkClick}
                    >
                      Admin Dashboard
                    </Link>
                    <Link 
                      to="/admin/categories" 
                      className="flex items-center py-4 px-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium touch-manipulation text-base"
                      onClick={handleLinkClick}
                    >
                      Manage Categories
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full py-4 px-4 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium touch-manipulation text-base"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t p-4">
                <Link
                  to="/login"
                  className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-center font-medium text-base touch-manipulation"
                  onClick={handleLinkClick}
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;