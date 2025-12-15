import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, Badge } from '../../components/ui';
import { Plus, Droplet, Trash2, Clock, Filter } from 'lucide-react';
import { getLocalIceMakes, getTodayIceMakesCount } from '../../services/ice-make-service';
import { formatDate } from '../../lib/utils';
import type { IceMakeLog } from '../../types';

export function IceMakeList() {
  const [iceMakes, setIceMakes] = useState<IceMakeLog[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [logs, count] = await Promise.all([
        getLocalIceMakes(),
        getTodayIceMakesCount(),
      ]);

      // Sort by date descending
      logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Apply filter
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      let filtered = logs;
      if (filter === 'today') {
        filtered = logs.filter((m) => m.created_at.startsWith(today));
      } else if (filter === 'week') {
        filtered = logs.filter((m) => m.created_at >= weekAgo);
      }

      setIceMakes(filtered);
      setTodayCount(count);
      setIsLoading(false);
    }
    loadData();
  }, [filter]);

  const getRinkName = (rinkId: string) => {
    const rinks: Record<string, string> = {
      'rink-a': 'Rink A',
      'rink-b': 'Rink B',
    };
    return rinks[rinkId] || rinkId;
  };

  const getResurfacerName = (resurfacerId: string) => {
    const machines: Record<string, string> = {
      'z1': 'Zamboni #1',
      'z2': 'Zamboni #2',
    };
    return machines[resurfacerId] || resurfacerId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">Ice Make Logs</h1>
          <p className="text-wolf-600 mt-1">Track resurfacer runs and water usage</p>
        </div>
        <Link to="/ice-ops/ice-make/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>Log Ice Make</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-action-50 border-action-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-action-700">Today's Ice Makes</p>
                <p className="text-3xl font-bold text-action-800">{todayCount}</p>
              </div>
              <div className="p-3 bg-action-100 rounded-lg">
                <Droplet className="h-6 w-6 text-action" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">This Week</p>
                <p className="text-3xl font-bold text-blue-800">
                  {iceMakes.filter((m) => {
                    const now = new Date();
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
                    return m.created_at >= weekAgo;
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Avg Snow Level</p>
                <p className="text-3xl font-bold text-amber-800">
                  {iceMakes.length > 0
                    ? Math.round(
                        iceMakes.reduce((sum, m) => sum + m.snow_in_tank_percent, 0) /
                          iceMakes.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Trash2 className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-wolf-500" />
        <span className="text-sm text-wolf-600">Filter:</span>
        {(['all', 'today', 'week'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === f
                ? 'bg-navy text-white'
                : 'bg-wolf-100 text-wolf-600 hover:bg-wolf-200'
            }`}
          >
            {f === 'all' ? 'All Time' : f === 'today' ? 'Today' : 'This Week'}
          </button>
        ))}
      </div>

      {/* List */}
      <Card>
        <CardHeader title="Recent Ice Makes" />
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-wolf-500">Loading...</div>
          ) : iceMakes.length === 0 ? (
            <div className="p-8 text-center">
              <Droplet className="h-12 w-12 text-wolf-300 mx-auto mb-3" />
              <p className="text-wolf-600 font-medium">No ice makes logged yet</p>
              <p className="text-sm text-wolf-500 mt-1">
                Start logging resurfacer runs to track ice maintenance
              </p>
            </div>
          ) : (
            <div className="divide-y divide-wolf-100">
              {iceMakes.map((iceMake) => (
                <div
                  key={iceMake.id}
                  className="p-4 hover:bg-wolf-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Droplet className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-navy">
                            {getRinkName(iceMake.rink_id)}
                          </span>
                          <Badge
                            variant={iceMake.cut_type === 'wet' ? 'info' : 'warning'}
                          >
                            {iceMake.cut_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-wolf-600">
                          {getResurfacerName(iceMake.resurfacer_id)} &bull;{' '}
                          {formatDate(iceMake.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-wolf-500">Water</p>
                        <p className="font-medium text-blue-600">
                          {iceMake.water_used_percent}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-wolf-500">Snow</p>
                        <p className="font-medium text-amber-600">
                          {iceMake.snow_in_tank_percent}%
                        </p>
                      </div>
                      {!iceMake.synced && (
                        <Badge variant="warning">Pending Sync</Badge>
                      )}
                    </div>
                  </div>
                  {iceMake.notes && (
                    <p className="mt-2 text-sm text-wolf-600 pl-14">
                      {iceMake.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
