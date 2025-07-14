import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';

const CategorySection: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories({ active: true });
      setCategories(response.data.slice(0, 6)); // Show only first 6 categories
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to static categories if API fails
      setCategories(staticCategories);
    } finally {
      setLoading(false);
    }
  };

  // Fallback static categories with default images
  const staticCategories = [
    {
      _id: 'static-1',
      name: 'Dresses',
      image: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600',
      gender: 'women'
    },
    {
      _id: 'static-2',
      name: 'T-Shirts',
      image: 'https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&cs=tinysrgb&w=600',
      gender: 'men'
    },
    {
      _id: 'static-3',
      name: 'Accessories',
      image: 'https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?auto=compress&cs=tinysrgb&w=600',
      gender: 'unisex'
    },
    {
      _id: 'static-4',
      name: 'Shoes',
      image: 'https://images.pexels.com/photos/1032110/pexels-photo-1032110.jpeg?auto=compress&cs=tinysrgb&w=600',
      gender: 'unisex'
    },
    {
      _id: 'static-5',
      name: 'Jackets',
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      gender: 'unisex'
    },
    {
      _id: 'static-6',
      name: 'Activewear',
      image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=600',
      gender: 'unisex'
    }
  ];
  const getCategoryImage = (category: any) => {
    // Use category image if available, otherwise fallback to default based on name
    if (category.image) return category.image;
    
    const defaultImages: { [key: string]: string } = {
      'dresses': 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600',
      't-shirts': 'https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&cs=tinysrgb&w=600',
      'kurti': 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=600',
      'accessories': 'https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?auto=compress&cs=tinysrgb&w=600',
      'shoes': 'https://images.pexels.com/photos/1032110/pexels-photo-1032110.jpeg?auto=compress&cs=tinysrgb&w=600',
      'jackets': 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'activewear': 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=600',
      'jeans': 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600',
      'blouses': 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=600'
    };
    
    const categoryKey = category.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return defaultImages[categoryKey] || 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
  };

  const getCategoryLink = (category: any) => {
    return `/products/${category.gender}/${encodeURIComponent(category.name)}`;
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our extensive collection across different categories
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-2xl aspect-square"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse our extensive collection across different categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={getCategoryLink(category)}
              className="group relative overflow-hidden rounded-2xl bg-gray-100 aspect-square hover:shadow-2xl transition-all duration-300"
            >
              <img
                src={getCategoryImage(category)}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300">
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-white text-xl font-bold mb-2">{category.name}</h3>
                  <p className="text-white text-sm opacity-90 mb-2 capitalize">{category.gender}</p>
                  <div className="inline-flex items-center text-white text-sm group-hover:text-purple-300 transition-colors">
                    <span>Shop Now</span>
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {categories.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No categories available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;