import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users, Calendar, Download } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import { productsAPI, ordersAPI, categoriesAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    conversionRate: 3.2,
    salesData: [],
    categoryData: [],
    topProducts: [],
    customerMetrics: [],
    trafficSources: []
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from APIs
      const [ordersResponse, productsResponse, categoriesResponse] = await Promise.all([
        ordersAPI.getAllOrders({ limit: 1000 }),
        productsAPI.getProducts({ limit: 1000 }),
        categoriesAPI.getCategories()
      ]);

      const orders = ordersResponse.data.orders || [];
      const products = productsResponse.data.products || [];
      const categories = categoriesResponse.data || [];

      // Calculate metrics
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Generate sales data for the last 7 days
      const salesData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Filter orders for this date
        const dayOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.toDateString() === date.toDateString();
        });
        
        const dayRevenue = dayOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
        const dayCustomers = new Set(dayOrders.map((order: any) => order.user?._id || order.user)).size;
        
        salesData.push({
          date: date.toISOString().split('T')[0],
          revenue: dayRevenue,
          orders: dayOrders.length,
          customers: dayCustomers
        });
      }

      // Calculate category distribution
      const categoryStats: { [key: string]: { value: number, revenue: number } } = {};
      
      orders.forEach((order: any) => {
        order.items?.forEach((item: any) => {
          const category = item.product?.category || 'Unknown';
          if (!categoryStats[category]) {
            categoryStats[category] = { value: 0, revenue: 0 };
          }
          categoryStats[category].value += item.quantity || 1;
          categoryStats[category].revenue += (item.price || 0) * (item.quantity || 1);
        });
      });

      const categoryData = Object.entries(categoryStats)
        .map(([name, stats], index) => ({
          name,
          value: Math.round((stats.value / Object.values(categoryStats).reduce((sum, s) => sum + s.value, 0)) * 100),
          revenue: stats.revenue,
          color: ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#6B7280'][index % 5]
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Calculate top products
      const productStats: { [key: string]: { sales: number, revenue: number, product: any } } = {};
      
      orders.forEach((order: any) => {
        order.items?.forEach((item: any) => {
          const productId = item.product?._id || item.productId;
          if (!productStats[productId]) {
            productStats[productId] = { sales: 0, revenue: 0, product: item.product };
          }
          productStats[productId].sales += item.quantity || 1;
          productStats[productId].revenue += (item.price || 0) * (item.quantity || 1);
        });
      });

      const topProducts = Object.values(productStats)
        .filter(stat => stat.product?.name)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(stat => ({
          name: stat.product.name,
          sales: stat.sales,
          revenue: stat.revenue,
          growth: Math.random() * 20 - 5 // Mock growth data
        }));

      // Customer metrics (mock data based on real orders)
      const uniqueCustomers = new Set(orders.map((order: any) => order.user?._id || order.user)).size;
      const customerMetrics = [
        { metric: 'New Customers', value: Math.floor(uniqueCustomers * 0.3), change: 12.5, period: 'vs last month' },
        { metric: 'Returning Customers', value: Math.floor(uniqueCustomers * 0.7), change: 8.2, period: 'vs last month' },
        { metric: 'Customer Lifetime Value', value: avgOrderValue * 3.5, change: 15.3, period: 'average' },
        { metric: 'Churn Rate', value: 3.2, change: -1.1, period: 'vs last month' },
      ];

      // Traffic sources (mock data)
      const trafficSources = [
        { source: 'Organic Search', visitors: 4250, percentage: 42.5, color: '#8B5CF6' },
        { source: 'Direct', visitors: 2800, percentage: 28.0, color: '#EC4899' },
        { source: 'Social Media', visitors: 1500, percentage: 15.0, color: '#10B981' },
        { source: 'Email', visitors: 900, percentage: 9.0, color: '#F59E0B' },
        { source: 'Paid Ads', visitors: 550, percentage: 5.5, color: '#6B7280' },
      ];

      setAnalyticsData({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        conversionRate: 3.2, // Mock data
        salesData,
        categoryData,
        topProducts,
        customerMetrics,
        trafficSources
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const data = {
      ...analyticsData,
      exportDate: new Date().toISOString(),
      dateRange
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive insights into your business performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={exportData}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Download size={20} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${analyticsData.totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-green-600 mt-1">+12.5% vs last month</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign size={24} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalOrders}</p>
                <p className="text-sm text-green-600 mt-1">+8.2% vs last month</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <ShoppingCart size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.conversionRate}%</p>
                <p className="text-sm text-green-600 mt-1">+0.5% vs last month</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">${analyticsData.avgOrderValue.toFixed(2)}</p>
                <p className="text-sm text-green-600 mt-1">+5.1% vs last month</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Calendar size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sales by Category */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales by Category</h3>
            {analyticsData.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No category data available
              </div>
            )}
          </div>
        </div>

        {/* Orders and Customers Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Orders & Customer Acquisition</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analyticsData.salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#EC4899" strokeWidth={2} name="Orders" />
              <Line yAxisId="right" type="monotone" dataKey="customers" stroke="#10B981" strokeWidth={2} name="New Customers" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Products</h3>
            <div className="space-y-4">
              {analyticsData.topProducts.length > 0 ? (
                analyticsData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${product.revenue.toFixed(2)}</p>
                      <p className={`text-sm ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.growth >= 0 ? '+' : ''}{product.growth.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No product data available
                </div>
              )}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic Sources</h3>
            <div className="space-y-4">
              {analyticsData.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="font-medium text-gray-900">{source.source}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{source.visitors.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{source.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {analyticsData.customerMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">{metric.metric}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.metric.includes('Value') ? '$' : ''}
                  {typeof metric.value === 'number' ? metric.value.toFixed(metric.metric.includes('Value') ? 2 : 0) : metric.value}
                  {metric.metric.includes('Rate') ? '%' : ''}
                </p>
                <p className={`text-sm mt-1 ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change >= 0 ? '+' : ''}{metric.change}% {metric.period}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;