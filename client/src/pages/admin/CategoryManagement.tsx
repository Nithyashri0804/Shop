import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Tag, Users, Package } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { categoriesAPI, productsAPI } from '../../services/api';
import { Category } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [categoryStats, setCategoryStats] = useState<{[key: string]: number}>({});
  const [formData, setFormData] = useState({
    name: '',
    gender: 'women' as 'men' | 'women' | 'unisex',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
    fetchCategoryStats();
  }, [genderFilter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = genderFilter !== 'all' ? { gender: genderFilter } : {};
      const response = await categoriesAPI.getCategories(params);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryStats = async () => {
    try {
      // Fetch products to get category statistics
      const response = await productsAPI.getProducts({ limit: 1000 });
      const products = response.data.products;
      
      const stats: {[key: string]: number} = {};
      products.forEach((product: any) => {
        stats[product.category] = (stats[product.category] || 0) + 1;
      });
      
      setCategoryStats(stats);
    } catch (error) {
      console.error('Error fetching category stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoriesAPI.updateCategory(editingCategory._id, formData);
      } else {
        await categoriesAPI.createCategory(formData);
      }
      
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', gender: 'women', description: '', isActive: true });
      fetchCategories();
      fetchCategoryStats();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      gender: category.gender,
      description: category.description || '',
      isActive: category.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, categoryName: string) => {
    const productCount = categoryStats[categoryName] || 0;
    
    if (productCount > 0) {
      alert(`Cannot delete category "${categoryName}" because it has ${productCount} products. Please move or delete the products first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      try {
        await categoriesAPI.deleteCategory(id);
        fetchCategories();
        fetchCategoryStats();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error deleting category');
      }
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.isActive).length;
  const womenCategories = categories.filter(c => c.gender === 'women').length;
  const menCategories = categories.filter(c => c.gender === 'men').length;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Category Management</h1>
            <p className="text-gray-600 mt-2">Organize your products with well-structured categories</p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', gender: 'women', description: '', isActive: true });
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Category</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Tag size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Categories</p>
                <p className="text-2xl font-bold text-gray-900">{activeCategories}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Package size={24} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Women Categories</p>
                <p className="text-2xl font-bold text-gray-900">{womenCategories}</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <Users size={24} className="text-pink-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Men Categories</p>
                <p className="text-2xl font-bold text-gray-900">{menCategories}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="all">All Genders</option>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                            <Tag size={20} className="text-white" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.gender === 'women' 
                            ? 'bg-pink-100 text-pink-800'
                            : category.gender === 'men'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {category.gender.charAt(0).toUpperCase() + category.gender.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {category.description ? (
                            <span className="truncate block" title={category.description}>
                              {category.description}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">No description</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {categoryStats[category.name] || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id, category.name)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <Tag size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No categories found</p>
                <p className="text-gray-400 text-sm">Create your first category to organize your products</p>
              </div>
            )}
          </div>
        )}

        {/* Category Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="e.g., Dresses, T-Shirts, Shoes"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a clear, descriptive name for your category
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    💡 Tip: Categories created here will be available for product creation
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'men' | 'women' | 'unisex' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    rows={3}
                    placeholder="Describe what products belong in this category..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active (visible to customers)
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CategoryManagement;