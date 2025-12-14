import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, Badge } from '../../components/ui';
import { Plus, ClipboardCheck, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { getLocalCircleChecks, getTodayCircleChecks } from '../../services/circle-check-service';
import { formatDate } from '../../lib/utils';
import type { CircleCheckLog } from '../../types';

export function CircleCheckList() {
  const [circleChecks, setCircleChecks] = useState<CircleCheckLog[]>([]);
  const [todayChecks, setTodayChecks] = useState<CircleCheckLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [all, today] = await Promise.all([
        getLocalCircleChecks(),
        getTodayCircleChecks(),
      ]);

      all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setCircleChecks(all);
      setTodayChecks(today);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const getResurfacerName = (resurfacerId: string) => {
    const machines: Record<string, string> = {
      'z1': 'Zamboni #1 (Electric)',
      'z2': 'Zamboni #2 (Propane)',
    };
    return machines[resurfacerId] || resurfacerId;
  };

  const getFailedItemsCount = (items: Record<string, string>) => {
    return Object.values(items).filter((s) => s === 'fail').length;
  };

  // Check which machines still need circle checks today
  const machinesNeedingCheck = [
    { id: 'z1', name: 'Zamboni #1' },
    { id: 'z2', name: 'Zamboni #2' },
  ].filter((m) => !todayChecks.some((c) => c.resurfacer_id === m.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">Circle Checks</h1>
          <p className="text-wolf-600 mt-1">Pre-shift resurfacer inspections</p>
        </div>
        <Link to="/ice-ops/circle-check/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Circle Check</Button>
        </Link>
      </div>

      {/* Alert for machines needing check */}
      {machinesNeedingCheck.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Circle Checks Needed</p>
                <p className="text-sm text-amber-700 mt-1">
                  The following machines haven't been checked today:{' '}
                  {machinesNeedingCheck.map((m) => m.name).join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-action-50 border-action-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-action-700">Today's Checks</p>
                <p className="text-3xl font-bold text-action-800">{todayChecks.length}</p>
              </div>
              <div className="p-3 bg-action-100 rounded-lg">
                <ClipboardCheck className="h-6 w-6 text-action" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Passed Today</p>
                <p className="text-3xl font-bold text-green-800">
                  {todayChecks.filter((c) => c.passed).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Failed Today</p>
                <p className="text-3xl font-bold text-red-800">
                  {todayChecks.filter((c) => !c.passed).length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card>
        <CardHeader title="Recent Circle Checks" />
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-wolf-500">Loading...</div>
          ) : circleChecks.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardCheck className="h-12 w-12 text-wolf-300 mx-auto mb-3" />
              <p className="text-wolf-600 font-medium">No circle checks yet</p>
              <p className="text-sm text-wolf-500 mt-1">
                Start logging pre-shift inspections
              </p>
            </div>
          ) : (
            <div className="divide-y divide-wolf-100">
              {circleChecks.map((check) => {
                const failedCount = getFailedItemsCount(check.items);
                return (
                  <div
                    key={check.id}
                    className="p-4 hover:bg-wolf-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            check.passed ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          {check.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-navy">
                              {getResurfacerName(check.resurfacer_id)}
                            </span>
                            <Badge variant={check.passed ? 'ideal' : 'critical'}>
                              {check.passed ? 'Passed' : 'Failed'}
                            </Badge>
                            <Badge variant="default">
                              {check.checklist_type === 'electric' ? 'Electric' : 'Gas/Propane'}
                            </Badge>
                          </div>
                          <p className="text-sm text-wolf-600">{formatDate(check.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        {failedCount > 0 && (
                          <div className="text-red-600">
                            {failedCount} failed item{failedCount > 1 ? 's' : ''}
                          </div>
                        )}
                        {!check.synced && <Badge variant="warning">Pending Sync</Badge>}
                      </div>
                    </div>
                    {check.notes && (
                      <p className="mt-2 text-sm text-wolf-600 pl-14">{check.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
