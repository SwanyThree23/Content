import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { MessageSquare, FileText, Zap, TrendingUp } from 'lucide-react';
import api from '../lib/api';

export function Dashboard() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
    enabled: false // only enabled for admins
  });

  const usagePercent = user
    ? Math.round(((user as any).api_calls_used / (user as any).api_calls_limit) * 100)
    : 0;

  const metrics = [
    { label: 'API Calls Used', value: (user as any)?.api_calls_used ?? 0, icon: Zap, color: 'text-blue-600' },
    { label: 'API Limit', value: (user as any)?.api_calls_limit ?? 100, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Plan', value: (user as any)?.tier?.toUpperCase() ?? 'FREE', icon: MessageSquare, color: 'text-purple-600' },
    { label: 'Usage', value: `${usagePercent}%`, icon: FileText, color: 'text-orange-600' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.full_name || user?.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold mt-1">{value}</p>
              </div>
              <Icon className={`${color} opacity-80`} size={28} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">API Usage</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Used</span>
              <span className="font-medium">{(user as any)?.api_calls_used} / {(user as any)?.api_calls_limit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{100 - usagePercent}% remaining this month</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Start Stream', href: '/streaming' },
              { label: 'Upload Doc', href: '/documents' },
              { label: 'AI Chat', href: '/ai' },
              { label: 'Upgrade Plan', href: '/billing' }
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-center py-3 px-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-sm font-medium transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
