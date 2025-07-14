import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Instagram, Send, Clock, Shield } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Chat with us instantly',
      value: '+91 98765 43210',
      link: 'https://wa.me/919876543210',
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-green-600'
    },
    {
      icon: Instagram,
      title: 'Instagram',
      description: 'Follow us for updates',
      value: '@shreadslife',
      link: 'https://www.instagram.com/shreadslife?igsh=MWljMnZleHFqd245eQ==',
      color: 'bg-pink-500 hover:bg-pink-600',
      textColor: 'text-pink-600'
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'Send us a message',
      value: 'shreadslife@gmail.com',
      link: 'mailto:shreadslife@gmail.com',
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-blue-600'
    },
    {
      icon: Phone,
      title: 'Phone',
      description: 'Call us directly',
      value: '+91 98765 43210',
      link: 'tel:+919876543210',
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-purple-600'
    }
  ];

  const businessHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 6:00 PM' },
    { day: 'Sunday', hours: '12:00 PM - 5:00 PM' }
  ];

  const faqs = [
    {
      question: 'What are your shipping charges?',
      answer: 'We offer free shipping on orders over $100. For orders below $100, shipping charges vary by location ($5-$50).'
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery typically takes 3-7 business days depending on your location. Metro cities receive faster delivery.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day hassle-free return policy. Items must be in original condition with tags attached.'
    },
    {
      question: 'Do you offer cash on delivery?',
      answer: 'Yes, we offer both cash on delivery and UPI/QR code payment options for your convenience.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8">
              We're here to help! Reach out to us through any of these channels
            </p>
            <div className="flex items-center justify-center space-x-2 text-purple-100">
              <Shield size={20} />
              <span className="text-sm font-medium">Trusted by 5K+ customers across India</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <a
                key={index}
                href={method.link}
                target={method.link.startsWith('http') ? '_blank' : '_self'}
                rel={method.link.startsWith('http') ? 'noopener noreferrer' : ''}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group text-center"
              >
                <div className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{method.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                <p className={`font-medium ${method.textColor}`}>{method.value}</p>
              </a>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
            
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="text-green-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Message Sent!</h3>
                <p className="text-gray-600 mb-4">
                  Thank you for contacting us. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">Select a subject</option>
                      <option value="order-inquiry">Order Inquiry</option>
                      <option value="product-question">Product Question</option>
                      <option value="return-exchange">Return/Exchange</option>
                      <option value="shipping">Shipping & Delivery</option>
                      <option value="payment">Payment Issues</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Information & FAQ */}
          <div className="space-y-8">
            {/* Business Hours */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Clock className="mr-3 text-purple-600" size={24} />
                Business Hours
              </h3>
              <div className="space-y-3">
                {businessHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium text-gray-700">{schedule.day}</span>
                    <span className="text-gray-600">{schedule.hours}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Quick Response:</strong> WhatsApp messages are typically answered within 1 hour during business hours.
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <MapPin className="mr-3 text-purple-600" size={24} />
                Our Location
              </h3>
              <div className="space-y-2 text-gray-600">
                <p className="font-medium text-gray-800">AS Shreads</p>
                <p>Mumbai, Maharashtra</p>
                <p>India</p>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  We serve customers across India with fast and reliable delivery to all major cities.
                </p>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <h4 className="font-medium text-gray-800 mb-2">{faq.question}</h4>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Stay Connected</h3>
          <p className="text-purple-100 mb-6">
            Follow us on social media for the latest updates, fashion tips, and exclusive offers!
          </p>
          <div className="flex justify-center space-x-6">
            <a
              href="https://www.instagram.com/shreadslife?igsh=MWljMnZleHFqd245eQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-full transition-all duration-200 hover:scale-110"
            >
              <Instagram size={24} />
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-full transition-all duration-200 hover:scale-110"
            >
              <MessageCircle size={24} />
            </a>
            <a
              href="mailto:shreadslife@gmail.com"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-full transition-all duration-200 hover:scale-110"
            >
              <Mail size={24} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;