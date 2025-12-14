import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui';
import { Users, Building2, Gauge, Snowflake, FileEdit } from 'lucide-react';

export function AdminDashboard() {
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
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-navy">Admin Panel</h1>
        <p className="text-wolf-600 mt-1">Manage your facility settings and users</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wolf-600">Active Users</p>
                <p className="text-2xl font-display font-bold text-navy mt-1">12</p>
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
                <p className="text-2xl font-display font-bold text-navy mt-1">2</p>
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
                <p className="text-2xl font-display font-bold text-navy mt-1">3</p>
              </div>
              <div className="p-2 bg-navy rounded-lg">
                <Snowflake className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-wolf-600">Custom Forms</p>
                <p className="text-2xl font-display font-bold text-navy mt-1">5</p>
              </div>
              <div className="p-2 bg-action rounded-lg">
                <FileEdit className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin sections grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <dt className="text-sm text-wolf-600">Database Status</dt>
              <dd className="text-sm font-medium text-action mt-1">Connected</dd>
            </div>
            <div>
              <dt className="text-sm text-wolf-600">Last Sync</dt>
              <dd className="text-sm font-medium text-navy mt-1">Just now</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
