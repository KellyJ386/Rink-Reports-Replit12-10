import { useState, useEffect } from 'react';
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
  Moon,
  Scissors,
} from 'lucide-react';
import { getTodayIceMakesCount, getRecentIceMakes } from '../services/ice-make-service';
import { getTodayCircleChecks, getRecentCircleChecks } from '../services/circle-check-service';
import { getRecentMeasurements } from '../services/ice-depth-service';
import { formatDate } from '../lib/utils';
import type { IceMakeLog, CircleCheckLog, IceDepthMeasurement } from '../types';

interface ActivityItem {
  type: 'ice_make' | 'measurement' | 'circle_check' | 'alert';
  description: string;
  time: string;
  timestamp: Date;
}

export function Dashboard() {
  const { user } = useAuth();

  // Live data state
  const [todayIceMakes, setTodayIceMakes] = useState(0);
  const [todayCircleChecks, setTodayCircleChecks] = useState(0);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [uncheckedMachines, setUncheckedMachines] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [iceMakeCount, circleChecks, recentIceMakes, recentCircles, recentMeasurements] = await Promise.all([
          getTodayIceMakesCount(),
          getTodayCircleChecks(),
          getRecentIceMakes(5),
          getRecentCircleChecks(5),
          getRecentMeasurements(5),
        ]);

        setTodayIceMakes(iceMakeCount);
        setTodayCircleChecks(circleChecks.length);

        // Build activity feed
        const activities: ActivityItem[] = [];

        recentIceMakes.forEach((log: IceMakeLog) => {
          activities.push({
            type: 'ice_make',
            description: `Ice resurfacing completed - ${log.cut_type} cut`,
            time: formatDate(log.created_at),
            timestamp: new Date(log.created_at),
          });
        });

        recentCircles.forEach((check: CircleCheckLog) => {
          activities.push({
            type: 'circle_check',
            description: `Circle check ${check.passed ? 'passed' : 'failed'}`,
            time: formatDate(check.created_at),
            timestamp: new Date(check.created_at),
          });
        });

        recentMeasurements.forEach((measurement: IceDepthMeasurement) => {
          activities.push({
            type: 'measurement',
            description: `Ice depth check recorded - Avg: ${measurement.avg_depth.toFixed(1)}mm`,
            time: formatDate(measurement.checked_at),
            timestamp: new Date(measurement.checked_at),
          });
        });

        // Sort by timestamp descending
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecentActivity(activities.slice(0, 5));

        // Check which machines haven't been checked
        const checkedMachineIds = new Set(circleChecks.map((c: CircleCheckLog) => c.resurfacer_id));
        const allMachines = [
          { id: 'z1', name: 'Zamboni #1' },
          { id: 'z2', name: 'Zamboni #2' },
        ];
        setUncheckedMachines(
          allMachines.filter((m) => !checkedMachineIds.has(m.id)).map((m) => m.name)
        );
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    {
      name: 'Ice Makes Today',
      value: isLoading ? '-' : todayIceMakes.toString(),
      change: 'Resurfacing runs',
      icon: Snowflake,
      href: '/ice-ops/ice-makes',
      color: 'bg-blue-500',
    },
    {
      name: 'Circle Checks Today',
      value: isLoading ? '-' : todayCircleChecks.toString(),
      change: uncheckedMachines.length > 0 ? `${uncheckedMachines.length} pending` : 'All complete',
      icon: ClipboardCheck,
      href: '/ice-ops/circle-checks',
      color: uncheckedMachines.length > 0 ? 'bg-amber-500' : 'bg-action',
    },
    {
      name: 'Ice Depth',
      value: 'Measure',
      change: 'Start new check',
      icon: Ruler,
      href: '/ice-depth/new',
      color: 'bg-navy',
    },
    {
      name: 'End of Day',
      value: 'Report',
      change: 'Submit daily summary',
      icon: Moon,
      href: '/ice-ops/end-of-day/new',
      color: 'bg-navy',
    },
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
          <Link to="/ice-ops/ice-make/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Log Ice Make
            </Button>
          </Link>
        </div>
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
              <Link to="/ice-ops">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  View All
                </Button>
              </Link>
            }
          />
          <CardContent>
            {isLoading ? (
              <p className="text-wolf-500 text-center py-4">Loading activity...</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-wolf-500 text-center py-4">No recent activity</p>
            ) : (
              <ul className="divide-y divide-wolf-200">
                {recentActivity.map((activity, index) => (
                  <li key={index} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2 w-2 rounded-full ${
                          activity.type === 'alert' ? 'bg-warning' :
                          activity.type === 'ice_make' ? 'bg-blue-500' :
                          activity.type === 'circle_check' ? 'bg-action' : 'bg-navy'
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
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" description="Common tasks" />
          <CardContent className="space-y-2">
            <Link
              to="/ice-ops/ice-make/new"
              className="flex items-center gap-3 p-3 rounded-lg border border-wolf-200 hover:border-action hover:bg-action-50 transition-colors"
            >
              <Snowflake className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-navy">Log Ice Make</span>
            </Link>
            <Link
              to="/ice-ops/circle-check/new"
              className="flex items-center gap-3 p-3 rounded-lg border border-wolf-200 hover:border-action hover:bg-action-50 transition-colors"
            >
              <ClipboardCheck className="h-5 w-5 text-action" />
              <span className="text-sm font-medium text-navy">Circle Check</span>
            </Link>
            <Link
              to="/ice-depth/new"
              className="flex items-center gap-3 p-3 rounded-lg border border-wolf-200 hover:border-action hover:bg-action-50 transition-colors"
            >
              <Ruler className="h-5 w-5 text-navy" />
              <span className="text-sm font-medium text-navy">Measure Ice Depth</span>
            </Link>
            <Link
              to="/ice-ops/blade-change/new"
              className="flex items-center gap-3 p-3 rounded-lg border border-wolf-200 hover:border-action hover:bg-action-50 transition-colors"
            >
              <Scissors className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-navy">Log Blade Change</span>
            </Link>
            <Link
              to="/ice-ops/end-of-day/new"
              className="flex items-center gap-3 p-3 rounded-lg border border-wolf-200 hover:border-action hover:bg-action-50 transition-colors"
            >
              <Moon className="h-5 w-5 text-navy" />
              <span className="text-sm font-medium text-navy">End of Day Report</span>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Module Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/ice-depth">
          <Card hoverable className="h-full bg-navy-50 border-navy-200">
            <CardContent className="py-6 text-center">
              <Ruler className="h-10 w-10 text-navy mx-auto mb-3" />
              <h3 className="font-semibold text-navy">Ice Depth Module</h3>
              <p className="text-sm text-wolf-600 mt-1">Measure and track ice thickness</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/ice-ops">
          <Card hoverable className="h-full bg-action-50 border-action-200">
            <CardContent className="py-6 text-center">
              <Snowflake className="h-10 w-10 text-action mx-auto mb-3" />
              <h3 className="font-semibold text-navy">Ice Operations</h3>
              <p className="text-sm text-wolf-600 mt-1">Daily ice maintenance tasks</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin">
          <Card hoverable className="h-full bg-wolf-50 border-wolf-200">
            <CardContent className="py-6 text-center">
              <TrendingUp className="h-10 w-10 text-wolf-600 mx-auto mb-3" />
              <h3 className="font-semibold text-navy">Admin Panel</h3>
              <p className="text-sm text-wolf-600 mt-1">Settings and configuration</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
