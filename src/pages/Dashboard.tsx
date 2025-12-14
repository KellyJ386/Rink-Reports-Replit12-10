import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import {
  Ruler,
  Snowflake,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowRight,
} from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();

  // Demo data for the dashboard
  const stats = [
    {
      name: 'Ice Depth Checks',
      value: '12',
      change: '+2 this week',
      icon: Ruler,
      href: '/ice-depth',
      color: 'bg-action',
    },
    {
      name: 'Ice Makes Today',
      value: '8',
      change: '4 pending',
      icon: Snowflake,
      href: '/ice-operations',
      color: 'bg-navy',
    },
    {
      name: 'Circle Checks',
      value: '24',
      change: 'All passed',
      icon: ClipboardCheck,
      href: '/ice-operations/circle-check/new',
      color: 'bg-action',
    },
    {
      name: 'Avg Ice Depth',
      value: '32mm',
      change: 'Within range',
      icon: TrendingUp,
      href: '/ice-depth',
      color: 'bg-navy',
    },
  ];

  const recentActivity = [
    { type: 'ice_make', description: 'Ice resurfacing completed on Rink A', time: '10 min ago' },
    { type: 'measurement', description: 'Ice depth check recorded', time: '1 hour ago' },
    { type: 'circle_check', description: 'Pre-operation check passed', time: '2 hours ago' },
    { type: 'alert', description: 'Low ice depth warning on Rink B', time: '3 hours ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">
            Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-wolf-600 mt-1">
            Here's what's happening at your facility today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/ice-depth/new">
            <Button variant="secondary" leftIcon={<Ruler className="h-4 w-4" />}>
              New Measurement
            </Button>
          </Link>
          <Link to="/ice-operations/ice-make/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Log Ice Make
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.href}>
            <Card hoverable className="h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-wolf-600">{stat.name}</p>
                  <p className="text-2xl font-display font-bold text-navy mt-1">{stat.value}</p>
                  <p className="text-sm text-wolf-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Activity"
            description="Latest operations and measurements"
            action={
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View All
              </Button>
            }
          />
          <CardContent>
            <ul className="divide-y divide-wolf-200">
              {recentActivity.map((activity, index) => (
                <li key={index} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        activity.type === 'alert' ? 'bg-warning' : 'bg-action'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-navy">{activity.description}</p>
                      <p className="text-xs text-wolf-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader title="Alerts" description="Items requiring attention" />
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy">Low Ice Depth</p>
                  <p className="text-xs text-wolf-600 mt-1">
                    Rink B center ice measuring 22mm - consider adding water.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-wolf-50 rounded-lg border border-wolf-200">
                <ClipboardCheck className="h-5 w-5 text-wolf-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy">Blade Change Due</p>
                  <p className="text-xs text-wolf-600 mt-1">
                    Zamboni #1 approaching 150 hours since last change.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" description="Common tasks and operations" />
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/ice-depth/new"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-wolf-200 hover:border-action hover:bg-action-50 transition-colors"
            >
              <Ruler className="h-8 w-8 text-navy mb-2" />
              <span className="text-sm font-medium text-navy text-center">Measure Ice</span>
            </Link>
            <Link
              to="/ice-operations/ice-make/new"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-wolf-200 hover:border-action hover:bg-action-50 transition-colors"
            >
              <Snowflake className="h-8 w-8 text-navy mb-2" />
              <span className="text-sm font-medium text-navy text-center">Log Ice Make</span>
            </Link>
            <Link
              to="/ice-operations/circle-check/new"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-wolf-200 hover:border-action hover:bg-action-50 transition-colors"
            >
              <ClipboardCheck className="h-8 w-8 text-navy mb-2" />
              <span className="text-sm font-medium text-navy text-center">Circle Check</span>
            </Link>
            <Link
              to="/ice-operations/end-of-day/new"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-wolf-200 hover:border-action hover:bg-action-50 transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-navy mb-2" />
              <span className="text-sm font-medium text-navy text-center">End of Day</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
