import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, Badge } from '../../components/ui';
import { Plus, Scissors, TrendingUp } from 'lucide-react';
import { getLocalBladeChanges, getAverageBladeLife } from '../../services/blade-change-service';
import { formatDate } from '../../lib/utils';
import type { BladeChangeLog } from '../../types';

export function BladeChangeList() {
  const [bladeChanges, setBladeChanges] = useState<BladeChangeLog[]>([]);
  const [avgLife, setAvgLife] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const changes = await getLocalBladeChanges();
      changes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setBladeChanges(changes);

      // Get average life for each resurfacer
      const avgLifeData: Record<string, number> = {};
      for (const resurfacerId of ['z1', 'z2']) {
        avgLifeData[resurfacerId] = await getAverageBladeLife(resurfacerId);
      }
      setAvgLife(avgLifeData);

      setIsLoading(false);
    }
    loadData();
  }, []);

  const getResurfacerName = (resurfacerId: string) => {
    const machines: Record<string, string> = {
      'z1': 'Zamboni #1',
      'z2': 'Zamboni #2',
    };
    return machines[resurfacerId] || resurfacerId;
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Scheduled',
      wear: 'Wear',
      damage: 'Damage',
      quality_issues: 'Quality',
    };
    return labels[reason] || reason;
  };

  const getReasonVariant = (reason: string): 'info' | 'warning' | 'critical' | 'default' => {
    const variants: Record<string, 'info' | 'warning' | 'critical' | 'default'> = {
      scheduled: 'info',
      wear: 'default',
      damage: 'critical',
      quality_issues: 'warning',
    };
    return variants[reason] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">Blade Changes</h1>
          <p className="text-wolf-600 mt-1">Track blade replacements and life</p>
        </div>
        <Link to="/ice-ops/blade-change/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>Log Blade Change</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-navy-50 border-navy-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-navy-700">Total Changes</p>
                <p className="text-3xl font-bold text-navy">{bladeChanges.length}</p>
              </div>
              <div className="p-3 bg-navy-100 rounded-lg">
                <Scissors className="h-6 w-6 text-navy" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-action-50 border-action-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-action-700">Zamboni #1 Avg Life</p>
                <p className="text-3xl font-bold text-action-800">
                  {avgLife['z1'] ? `${avgLife['z1']} hrs` : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-action-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-action" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Zamboni #2 Avg Life</p>
                <p className="text-3xl font-bold text-blue-800">
                  {avgLife['z2'] ? `${avgLife['z2']} hrs` : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card>
        <CardHeader title="Blade Change History" />
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-wolf-500">Loading...</div>
          ) : bladeChanges.length === 0 ? (
            <div className="p-8 text-center">
              <Scissors className="h-12 w-12 text-wolf-300 mx-auto mb-3" />
              <p className="text-wolf-600 font-medium">No blade changes logged</p>
              <p className="text-sm text-wolf-500 mt-1">
                Start tracking blade replacements for analytics
              </p>
            </div>
          ) : (
            <div className="divide-y divide-wolf-100">
              {bladeChanges.map((change) => (
                <div key={change.id} className="p-4 hover:bg-wolf-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-navy-100 rounded-lg">
                        <Scissors className="h-5 w-5 text-navy" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-navy">
                            {getResurfacerName(change.resurfacer_id)}
                          </span>
                          <Badge variant={getReasonVariant(change.reason)}>
                            {getReasonLabel(change.reason)}
                          </Badge>
                        </div>
                        <p className="text-sm text-wolf-600">{formatDate(change.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-wolf-500">Hour Meter</p>
                        <p className="font-medium text-navy">{change.hour_meter_reading} hrs</p>
                      </div>
                      {change.hours_since_last_change > 0 && (
                        <div className="text-center">
                          <p className="text-wolf-500">Blade Life</p>
                          <p className="font-medium text-action">
                            {change.hours_since_last_change} hrs
                          </p>
                        </div>
                      )}
                      {!change.synced && <Badge variant="warning">Pending Sync</Badge>}
                    </div>
                  </div>
                  {change.notes && (
                    <p className="mt-2 text-sm text-wolf-600 pl-14">{change.notes}</p>
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
