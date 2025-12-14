import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui';
import { Users, Building2, Gauge, Snowflake, Sliders } from 'lucide-react';
import { getAdminStats } from '../../services/admin-service';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalRinks: 0,
    activeResurfacers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await getAdminStats();
      setStats(data);
      setIsLoading(false);
    }
    loadStats();
  }, []);

  const adminSections = [
    {
      name: 'User Management',
      description: 'Manage staff accounts and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'bg-navy',
    },
    {
      name: 'Facility Settings',
      description: 'Configure facility information',
      icon: Building2,
      href: '/admin/facility',
      color: 'bg-action',
    },
    {
      name: 'Rink Configuration',
      description: 'Set up rinks and measurement templates',
      icon: Gauge,
      href: '/admin/rinks',
      color: 'bg-navy',
    },
    {
      name: 'Resurfacer Management',
      description: 'Manage ice resurfacer inventory',
      icon: Snowflake,
      href: '/admin/resurfacers',
      color: 'bg-action',
    },
    {
      name: 'Threshold Settings',
      description: 'Configure alert thresholds and targets',
      icon: Sliders,
      href: '/admin/thresholds',
      color: 'bg-navy',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-navy">Admin Panel</h1>
        <p className="text-wolf-600 mt-1">Manage your facility settings and users</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wolf-600">Active Users</p>
                <p className="text-2xl font-display font-bold text-navy mt-1">
                  {isLoading ? '-' : stats.activeUsers}
                </p>
              </div>
              <div className="p-2 bg-navy rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wolf-600">Rinks</p>
                <p className="text-2xl font-display font-bold text-navy mt-1">
                  {isLoading ? '-' : stats.totalRinks}
                </p>
              </div>
              <div className="p-2 bg-action rounded-lg">
                <Gauge className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wolf-600">Resurfacers</p>
                <p className="text-2xl font-display font-bold text-navy mt-1">
                  {isLoading ? '-' : stats.activeResurfacers}
                </p>
              </div>
              <div className="p-2 bg-navy rounded-lg">
                <Snowflake className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin sections grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminSections.map((section) => (
          <Link key={section.href} to={section.href}>
            <Card hoverable className="h-full">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${section.color}`}>
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-navy">{section.name}</h3>
                    <p className="text-sm text-wolf-600 mt-1">{section.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* System info */}
      <Card>
        <CardHeader title="System Information" />
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <dt className="text-sm text-wolf-600">Application Version</dt>
              <dd className="text-sm font-medium text-navy mt-1">1.0.0</dd>
            </div>
            <div>
              <dt className="text-sm text-wolf-600">Environment</dt>
              <dd className="text-sm font-medium text-navy mt-1">Development</dd>
            </div>
            <div>
              <dt className="text-sm text-wolf-600">Storage</dt>
              <dd className="text-sm font-medium text-action mt-1">Local (IndexedDB)</dd>
            </div>
            <div>
              <dt className="text-sm text-wolf-600">Sync Status</dt>
              <dd className="text-sm font-medium text-wolf-500 mt-1">Offline Mode</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
