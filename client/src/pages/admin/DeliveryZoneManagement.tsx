import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Truck, DollarSign } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

interface DeliveryZone {
  id: string;
  name: string;
  rate: number;
  keywords: string[];
  isActive: boolean;
  description?: string;
}

const DeliveryZoneManagement: React.FC = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([
    {
      id: '1',
      name: 'Local (Same City)',
      rate: 5,
      keywords: ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad'],
      isActive: true,
      description: 'Major metropolitan cities with same-day delivery'
    },
    {
      id: '2',
      name: 'Metro Cities',
      rate: 15,
      keywords: ['pune', 'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur'],
      isActive: true,
      description: 'Tier 1 cities with 1-2 day delivery'
    },
    {
      id: '3',
      name: 'Tier 2 Cities',
      rate: 25,
      keywords: ['nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri'],
      isActive: true,
      description: 'Tier 2 cities with 2-3 day delivery'
    },
    {
      id: '4',
      name: 'Remote Areas',
      rate: 50,
      keywords: [],
      isActive: true,
      description: 'Remote areas and villages with 5-7 day delivery'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    keywords: '',
    description: '',
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const zoneData: DeliveryZone = {
      id: editingZone?.id || Date.now().toString(),
      name: formData.name,
      rate: parseFloat(formData.rate),
      keywords: formData.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k),
      description: formData.description,
      isActive: formData.isActive
    };

    if (editingZone) {
      setZones(zones.map(zone => zone.id === editingZone.id ? zoneData : zone));
    } else {
      setZones([...zones, zoneData]);
    }

    resetForm();
    setShowModal(false);
  };

  const handleEdit = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      rate: zone.rate.toString(),
      keywords: zone.keywords.join(', '),
      description: zone.description || '',
      isActive: zone.isActive
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this delivery zone?')) {
      setZones(zones.filter(zone => zone.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      rate: '',
      keywords: '',
      description: '',
      isActive: true
    });
    setEditingZone(null);
  };

  const toggleZoneStatus = (id: string) => {
    setZones(zones.map(zone => 
      zone.id === id ? { ...zone, isActive: !zone.isActive } : zone
    ));
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Delivery Zone Management</h1>
            <p className="text-gray-600 mt-2">Configure delivery rates based on location</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Zone</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Zones</p>
                <p className="text-2xl font-bold text-gray-900">{zones.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <MapPin size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Zones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {zones.filter(z => z.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Truck size={24} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${zones.length > 0 ? (zones.reduce((sum, z) => sum + z.rate, 0) / zones.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <DollarSign size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coverage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {zones.reduce((sum, z) => sum + z.keywords.length, 0)} cities
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <MapPin size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Zones Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zone Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coverage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                          <MapPin size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{zone.name}</div>
                          {zone.description && (
                            <div className="text-sm text-gray-500">{zone.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${zone.rate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {zone.keywords.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {zone.keywords.slice(0, 3).map((keyword, index) => (
                              <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                {keyword}
                              </span>
                            ))}
                            {zone.keywords.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{zone.keywords.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Default zone</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleZoneStatus(zone.id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                          zone.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {zone.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(zone)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(zone.id)}
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
        </div>

        {/* Zone Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">
                {editingZone ? 'Edit Delivery Zone' : 'Add New Delivery Zone'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="e.g., Metro Cities"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Rate ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="15.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="mumbai, delhi, bangalore"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cities/areas that match this zone. Leave empty for default zone.
                  </p>
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
                    placeholder="Brief description of this delivery zone..."
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
                    Active (available for delivery)
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
                    {editingZone ? 'Update Zone' : 'Create Zone'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Free Shipping Notice */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Truck className="text-green-600 mr-2" size={20} />
            <div>
              <h3 className="text-sm font-medium text-green-800">Free Shipping Policy</h3>
              <p className="text-sm text-green-700 mt-1">
                Free shipping is automatically applied to all orders over $100, regardless of delivery zone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DeliveryZoneManagement;