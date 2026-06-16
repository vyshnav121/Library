import { BookMarked, Users, BookOpen, Coins, BarChart3, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminOverview() {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: { totalBooks: 0, totalUsers: 0, activeBorrows: 0, totalFines: 0 },
    monthlyTrends: [],
    categoryDistribution: [],
    recentLogs: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/borrow/stats');
        setData(res.data);
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [api]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text tracking-tight">System Analytics</h1>
        <p className="text-gray-500 mt-1">Live overview of library operations, audit logs, and transaction trends.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6 bg-surface/40 hover:bg-surface/60 transition-all border border-border">
          <div className="flex items-center">
            <div className="bg-purple-500/10 p-3 rounded-xl">
              <BookMarked className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-semibold text-gray-400 truncate">Total Books</p>
              <h3 className="text-2xl font-bold text-text mt-1">{data.summary.totalBooks}</h3>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-surface/40 hover:bg-surface/60 transition-all border border-border">
          <div className="flex items-center">
            <div className="bg-blue-500/10 p-3 rounded-xl">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-semibold text-gray-400 truncate">Total Users</p>
              <h3 className="text-2xl font-bold text-text mt-1">{data.summary.totalUsers}</h3>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-surface/40 hover:bg-surface/60 transition-all border border-border">
          <div className="flex items-center">
            <div className="bg-emerald-500/10 p-3 rounded-xl">
              <BookOpen className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-semibold text-gray-400 truncate">Active Loans</p>
              <h3 className="text-2xl font-bold text-text mt-1">{data.summary.activeBorrows}</h3>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-surface/40 hover:bg-surface/60 transition-all border border-border">
          <div className="flex items-center">
            <div className="bg-amber-500/10 p-3 rounded-xl">
              <Coins className="h-6 w-6 text-amber-400" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-semibold text-gray-400 truncate">Total Fines</p>
              <h3 className="text-2xl font-bold text-text mt-1">${data.summary.totalFines.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Area Chart */}
        <div className="card p-6 bg-surface/30 border border-border lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-text">Borrowing Demand Over Time</h3>
              <p className="text-xs text-gray-400">Total borrows logged per month</p>
            </div>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: '8px' }}
                  labelStyle={{ color: '#D1D5DB', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Borrows" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorBorrows)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="card p-6 bg-surface/30 border border-border flex flex-col">
          <h3 className="text-lg font-bold text-text mb-1">Catalog Breakdown</h3>
          <p className="text-xs text-gray-400 mb-6 font-medium">Book categories count</p>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs">
            {data.categoryDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-gray-300 font-medium">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit & Security Activity Logs */}
      <div className="card p-6 bg-surface/30 border border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-text">Security & Audit Activity Logs</h3>
            <p className="text-xs text-gray-400">Chronological history of operations and access lockouts</p>
          </div>
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> SECURE AUDIT
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800 text-sm">
            <thead>
              <tr className="text-gray-400 text-left uppercase tracking-wider font-semibold text-xs">
                <th className="pb-3">User</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3">User Agent</th>
                <th className="pb-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data.recentLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                data.recentLogs.map((log) => (
                  <tr key={log._id} className="text-gray-300 hover:bg-gray-800/20 transition-colors">
                    <td className="py-3 font-semibold text-primary">{log.user?.name || 'Anonymous'} ({log.user?.role || 'Guest'})</td>
                    <td className="py-3 font-medium text-text">{log.action}</td>
                    <td className="py-3 text-xs font-mono text-gray-400">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 text-xs text-gray-400 truncate max-w-[200px]" title={log.userAgent}>
                      {log.userAgent || 'Unknown'}
                    </td>
                    <td className="py-3 text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
