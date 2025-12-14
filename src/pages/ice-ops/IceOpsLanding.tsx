import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button } from '../../components/ui';
import { Droplet, ClipboardCheck, Scissors, Moon, ChevronRight, AlertTriangle } from 'lucide-react';
import { getTodayIceMakesCount } from '../../services/ice-make-service';
import { getTodayCircleChecks } from '../../services/circle-check-service';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgColor: string;
}

export function IceOpsLanding() {
  const [todayIceMakes, setTodayIceMakes] = useState(0);
  const [todayCircleChecks, setTodayCircleChecks] = useState(0);
  const [uncheckedMachines, setUncheckedMachines] = useState<string[]>([]);

  useEffect(() => {
    async function loadStats() {
      const [iceMakes, circleChecks] = await Promise.all([
        getTodayIceMakesCount(),
        getTodayCircleChecks(),
      ]);
      setTodayIceMakes(iceMakes);
      setTodayCircleChecks(circleChecks.length);

      // Check which machines haven't been checked
      const checkedMachineIds = new Set(circleChecks.map((c) => c.resurfacer_id));
      const allMachines = [
        { id: 'z1', name: 'Zamboni #1' },
        { id: 'z2', name: 'Zamboni #2' },
      ];
      setUncheckedMachines(
        allMachines.filter((m) => !checkedMachineIds.has(m.id)).map((m) => m.name)
      );
    }
    loadStats();
  }, []);

  const quickActions: QuickAction[] = [
    {
      title: 'Log Ice Make',
      description: 'Record a resurfacer run',
      icon: <Droplet className="h-6 w-6" />,
      href: '/ice-ops/ice-make/new',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Circle Check',
      description: 'Pre-shift inspection',
      icon: <ClipboardCheck className="h-6 w-6" />,
      href: '/ice-ops/circle-check/new',
      color: 'text-action',
      bgColor: 'bg-action-100',
    },
    {
      title: 'Blade Change',
      description: 'Log blade replacement',
      icon: <Scissors className="h-6 w-6" />,
      href: '/ice-ops/blade-change/new',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'End of Day',
      description: 'Submit shift report',
      icon: <Moon className="h-6 w-6" />,
      href: '/ice-ops/end-of-day/new',
      color: 'text-navy',
      bgColor: 'bg-navy-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-navy">Ice Operations</h1>
        <p className="text-wolf-600 mt-1">Manage daily ice maintenance activities</p>
      </div>

      {/* Alert for unchecked machines */}
      {uncheckedMachines.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">Circle Checks Needed</p>
                <p className="text-sm text-amber-700 mt-1">
                  {uncheckedMachines.join(', ')} {uncheckedMachines.length === 1 ? 'hasn\'t' : 'haven\'t'} been checked today
                </p>
              </div>
              <Link to="/ice-ops/circle-check/new">
                <Button size="sm" variant="danger">Start Check</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Droplet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Today's Ice Makes</p>
                <p className="text-3xl font-bold text-blue-800">{todayIceMakes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-action-50 border-action-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-action-100 rounded-lg">
                <ClipboardCheck className="h-6 w-6 text-action" />
              </div>
              <div>
                <p className="text-sm text-action-700">Circle Checks Today</p>
                <p className="text-3xl font-bold text-action-800">{todayCircleChecks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-navy mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} to={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${action.bgColor}`}>
                      <div className={action.color}>{action.icon}</div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-navy">{action.title}</p>
                      <p className="text-sm text-wolf-600">{action.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-wolf-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* View History Links */}
      <div>
        <h2 className="text-lg font-semibold text-navy mb-4">View History</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/ice-ops/ice-makes">
            <Button variant="secondary" className="w-full">Ice Makes</Button>
          </Link>
          <Link to="/ice-ops/circle-checks">
            <Button variant="secondary" className="w-full">Circle Checks</Button>
          </Link>
          <Link to="/ice-ops/blade-changes">
            <Button variant="secondary" className="w-full">Blade Changes</Button>
          </Link>
          <Link to="/ice-ops/end-of-day">
            <Button variant="secondary" className="w-full">EOD Reports</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
