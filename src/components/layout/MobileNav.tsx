import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { X, Snowflake } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui';
import {
  LayoutDashboard,
  Ruler,
  ClipboardCheck,
  Wrench,
  FileText,
  Settings,
  Users,
  Building2,
  Gauge,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Ice Depth', href: '/ice-depth', icon: Ruler },
  { name: 'Ice Makes', href: '/ice-operations', icon: Snowflake },
  { name: 'Circle Check', href: '/ice-operations/circle-check/new', icon: ClipboardCheck },
  { name: 'Blade Change', href: '/ice-operations/blade-change/new', icon: Wrench },
  { name: 'End of Day', href: '/ice-operations/end-of-day/new', icon: FileText },
];

const adminItems = [
  { name: 'Admin', href: '/admin', icon: Settings, roles: ['facility_manager', 'lead_ice_tech'] },
  { name: 'Users', href: '/admin/users', icon: Users, roles: ['facility_manager'] },
  { name: 'Facility', href: '/admin/facility', icon: Building2, roles: ['facility_manager'] },
  { name: 'Rinks', href: '/admin/rinks', icon: Gauge, roles: ['facility_manager', 'lead_ice_tech'] },
];

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { user } = useAuth();

  const canAccess = (item: { roles?: string[] }) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  };

  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out panel */}
      <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-navy z-50 lg:hidden">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-navy-400">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-action flex items-center justify-center">
              <Snowflake className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">MFO</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-navy-600"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="py-4 px-3 overflow-y-auto h-[calc(100vh-4rem)]">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  end={item.href === '/' || item.href === '/ice-operations'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
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

          {/* Admin section */}
          {adminItems.some(canAccess) && (
            <div className="mt-6 pt-6 border-t border-navy-400">
              <p className="px-3 mb-2 text-xs font-semibold text-wolf-400 uppercase tracking-wider">
                Admin
              </p>
              <ul className="space-y-1">
                {adminItems.filter(canAccess).map((item) => (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      end={item.href === '/admin'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
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
      </div>
    </Fragment>
  );
}
