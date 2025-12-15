import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Ruler,
  Snowflake,
  ClipboardCheck,
  Wrench,
  FileText,
  Settings,
  Users,
  Building2,
  Gauge,
  BarChart3,
  Bell,
  FormInput,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const mainNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Ice Depth', href: '/ice-depth', icon: Ruler },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const operationsNavItems: NavItem[] = [
  { name: 'Ice Makes', href: '/ice-operations', icon: Snowflake },
  { name: 'Circle Check', href: '/ice-operations/circle-check/new', icon: ClipboardCheck },
  { name: 'Blade Change', href: '/ice-operations/blade-change/new', icon: Wrench },
  { name: 'End of Day', href: '/ice-operations/end-of-day/new', icon: FileText },
];

const adminNavItems: NavItem[] = [
  { name: 'Admin', href: '/admin', icon: Settings, roles: ['facility_manager', 'lead_ice_tech'] },
  { name: 'Users', href: '/admin/users', icon: Users, roles: ['facility_manager'] },
  { name: 'Facility', href: '/admin/facility', icon: Building2, roles: ['facility_manager'] },
  { name: 'Rinks', href: '/admin/rinks', icon: Gauge, roles: ['facility_manager', 'lead_ice_tech'] },
  { name: 'Resurfacers', href: '/admin/resurfacers', icon: Snowflake, roles: ['facility_manager', 'lead_ice_tech'] },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell, roles: ['facility_manager'] },
  { name: 'Forms', href: '/admin/forms', icon: FormInput, roles: ['facility_manager'] },
];

export function Sidebar() {
  const { user } = useAuth();

  const canAccess = (item: NavItem) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  };

  return (
    <div className="flex flex-col h-full bg-navy">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-navy-400">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-action flex items-center justify-center">
            <Snowflake className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-white text-lg">MFO</span>
            <span className="block text-xs text-wolf-400">Ice Management</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {/* Main section */}
        <div className="mb-6">
          <p className="px-3 mb-2 text-xs font-semibold text-wolf-400 uppercase tracking-wider">
            Main
          </p>
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  end={item.href === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-action text-white'
                        : 'text-wolf-300 hover:bg-navy-600 hover:text-white'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Operations section */}
        <div className="mb-6">
          <p className="px-3 mb-2 text-xs font-semibold text-wolf-400 uppercase tracking-wider">
            Operations
          </p>
          <ul className="space-y-1">
            {operationsNavItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  end={item.href === '/ice-operations'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-action text-white'
                        : 'text-wolf-300 hover:bg-navy-600 hover:text-white'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Admin section */}
        {adminNavItems.some(canAccess) && (
          <div className="mb-6">
            <p className="px-3 mb-2 text-xs font-semibold text-wolf-400 uppercase tracking-wider">
              Admin
            </p>
            <ul className="space-y-1">
              {adminNavItems.filter(canAccess).map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    end={item.href === '/admin'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-action text-white'
                          : 'text-wolf-300 hover:bg-navy-600 hover:text-white'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-navy-400">
        <p className="text-xs text-wolf-500 text-center">
          MFO Ice Tech v1.0
        </p>
      </div>
    </div>
  );
}
