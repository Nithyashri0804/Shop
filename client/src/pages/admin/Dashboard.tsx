import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Eye,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { productsAPI, ordersAPI, categoriesAPI } from '../../services/api';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    productsGrowth: 0,
    usersGrowth: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [ordersResponse, productsResponse, categoriesResponse] = await Promise.all([
        ordersAPI.getAllOrders({ limit: 1000 }),
        productsAPI.getProducts({ limit: 1000 }),
        categoriesAPI.getCategories()
      ]);

      const orders = ordersResponse.data.orders || [];
      const products = productsResponse.data.products || [];
      const categories = categoriesResponse.data || [];

      // Calculate stats
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      const totalOrders = orders.length;
      const totalProducts = products.length;
      const activeProducts = products.filter((p: any) => p.isActive).length;

      // Get unique users from orders
      const uniqueUsers = new Set(orders.map((order: any) => order.user?._id || order.user)).size;

      // Calculate growth (mock data for now - in real app, compare with previous period)
      const revenueGrowth = 12.5; // This would be calculated from historical data
      const ordersGrowth = 8.2;
      const productsGrowth = 5.1;
      const usersGrowth = 15.3;

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts: activeProducts,
        totalUsers: uniqueUsers,
        revenueGrowth,
        ordersGrowth,
        productsGrowth,
        usersGrowth
      });

      // Set recent orders (last 10)
      const sortedOrders = orders
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      setRecentOrders(sortedOrders);

      // Calculate category distribution
      const categoryStats: { [key: string]: number } = {};
      products.forEach((product: any) => {
        categoryStats[product.category] = (categoryStats[product.category] || 0) + 1;
      });

      const categoryChartData = Object.entries(categoryStats)
        .map(([name, value], index) => ({
          name,
          value,
          color: ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#6B7280'][index % 5]
        }))
        .slice(0, 5); // Top 5 categories

      setCategoryData(categoryChartData);

      // Generate sales data for the last 6 months (mock data based on real orders)
      const monthlyData = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      
      for (let i = 0; i < 6; i++) {
        const monthOrders = Math.floor(totalOrders / 6) + Math.floor(Math.random() * 50);
        const monthSales = Math.floor(totalRevenue / 6) + Math.floor(Math.random() * 2000);
        
        monthlyData.push({
          name: months[i],
          sales: monthSales,
          orders: monthOrders
        });
      }
      
      setSalesData(monthlyData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, growth, icon: Icon, prefix = '', suffix = '' }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <Icon size={24} className="text-purple-600" />
        </div>
      </div>
      <div className="flex items-center mt-4">
        {growth >= 0 ? (
          <ArrowUpRight size={16} className="text-green-500 mr-1" />
        ) : (
          <ArrowDownRight size={16} className="text-red-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {Math.abs(growth)}%
        </span>
        <span className="text-sm text-gray-500 ml-1">vs last month</span>
      </div>
    </div>
  );

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            growth={stats.revenueGrowth}
            icon={DollarSign}
            prefix="$"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            growth={stats.ordersGrowth}
            icon={ShoppingCart}
          />
          <StatCard
            title="Active Products"
            value={stats.totalProducts}
            growth={stats.productsGrowth}
            icon={Package}
          />
          <StatCard
            title="Customers"
            value={stats.totalUsers}
            growth={stats.usersGrowth}
            icon={Users}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-600">
                <option>Last 6 months</option>
                <option>Last 12 months</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Products by Category</h3>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                      <span className="text-sm font-medium text-gray-900 ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No category data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {recentOrders.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.user?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(order.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.orderStatus === 'completed' || order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1) || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-purple-600 hover:text-purple-900 mr-3">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <div className="text-center">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No orders found</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;