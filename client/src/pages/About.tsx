import React from 'react';
import { Shield, Award, Users, Heart, Truck, RotateCcw, Star, CheckCircle } from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'SSL Secured',
      description: 'Your data is protected with industry-standard SSL encryption for safe shopping.'
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'Every product is carefully curated and quality-checked before reaching you.'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery across India with real-time tracking.'
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: '30-day hassle-free return policy for your peace of mind.'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Every decision we make puts our customers at the center.'
    },
    {
      icon: Star,
      title: 'Quality Excellence',
      description: 'We never compromise on the quality of products we offer.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Building a community of fashion enthusiasts who inspire each other.'
    },
    {
      icon: CheckCircle,
      title: 'Authentic Products',
      description: 'All our products are 100% genuine and sourced directly from trusted suppliers.'
    }
  ];

  const stats = [
    { number: '5K+', label: 'Happy Customers' },
    { number: '500+', label: 'Products' },
    { number: '50+', label: 'Cities Served' },
    { number: '4.8', label: 'Average Rating' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About AS Shreads</h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8">
              Your trusted partner in fashion, bringing style and authenticity to your doorstep
            </p>
            <div className="flex items-center justify-center space-x-2 text-purple-100">
              <Shield size={20} />
              <span className="text-sm font-medium">SSL Secured & Verified Business</span>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Founded in 2025, AS Shreads started as a small startup with a big dream - to make 
                    quality fashion accessible to everyone across India. What began as a passion project 
                    has grown into a trusted platform serving thousands of customers nationwide.
                  </p>
                  <p>
                    As a young startup, we understand the importance of building trust with our customers. 
                    That's why we've invested in SSL security, authentic product sourcing, and transparent 
                    business practices from day one.
                  </p>
                  <p>
                    Every product in our catalog is handpicked by our team, ensuring that you receive 
                    only the best quality items. We believe that great fashion shouldn't break the bank, 
                    and our competitive pricing reflects this philosophy.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Our team"
                  className="rounded-2xl shadow-lg"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="font-semibold text-gray-800">Verified Business</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="text-purple-600" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="text-purple-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{value.title}</h3>
                        <p className="text-gray-600">{value.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Trust Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Security & Trust</h2>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
              <div className="flex items-center justify-center mb-6">
                <Shield className="text-green-600 mr-3" size={32} />
                <h3 className="text-2xl font-bold text-gray-800">SSL Secured Platform</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  Your security is our top priority. Our website is protected with industry-standard 
                  SSL encryption, ensuring that all your personal and payment information is secure.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="text-green-600" size={24} />
                    </div>
                    <h4 className="font-semibold text-gray-800">256-bit SSL</h4>
                    <p className="text-sm text-gray-600">Bank-level encryption</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="text-blue-600" size={24} />
                    </div>
                    <h4 className="font-semibold text-gray-800">Verified Business</h4>
                    <p className="text-sm text-gray-600">Registered & compliant</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="text-purple-600" size={24} />
                    </div>
                    <h4 className="font-semibold text-gray-800">Customer Care</h4>
                    <p className="text-sm text-gray-600">24/7 support available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="text-xl text-purple-100 mb-8">
              Have questions? We'd love to hear from you. Reach out to us anytime.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a
                href="mailto:shreadslife@gmail.com"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <span>Email Us</span>
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href="https://www.instagram.com/shreadslife?igsh=MWljMnZleHFqd245eQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors flex items-center space-x-2"
              >
                <span>Follow Us</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;