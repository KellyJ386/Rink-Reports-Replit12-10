import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, Badge } from '../../components/ui';
import { Plus, Moon, FileText, CheckCircle } from 'lucide-react';
import { getLocalEndOfDayReports, hasReportForToday } from '../../services/end-of-day-service';
import { formatDate } from '../../lib/utils';
import type { EndOfDayReport } from '../../types';

export function EndOfDayList() {
  const [reports, setReports] = useState<EndOfDayReport[]>([]);
  const [rinkStatus, setRinkStatus] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const allReports = await getLocalEndOfDayReports();
      allReports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setReports(allReports);

      // Check if each rink has a report for today
      const status: Record<string, boolean> = {};
      for (const rinkId of ['rink-a', 'rink-b']) {
        status[rinkId] = await hasReportForToday(rinkId);
      }
      setRinkStatus(status);

      setIsLoading(false);
    }
    loadData();
  }, []);

  const getRinkName = (rinkId: string) => {
    const rinks: Record<string, string> = {
      'rink-a': 'Rink A',
      'rink-b': 'Rink B',
    };
    return rinks[rinkId] || rinkId;
  };

  const rinksNeedingReport = Object.entries(rinkStatus)
    .filter(([, hasReport]) => !hasReport)
    .map(([rinkId]) => getRinkName(rinkId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">End of Day Reports</h1>
          <p className="text-wolf-600 mt-1">Daily shift summaries and handoffs</p>
        </div>
        <Link to="/ice-ops/end-of-day/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Report</Button>
        </Link>
      </div>

      {/* Status alert */}
      {rinksNeedingReport.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Moon className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">End of Day Reports Needed</p>
                <p className="text-sm text-amber-700 mt-1">
                  The following rinks don't have today's report: {rinksNeedingReport.join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-navy-50 border-navy-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-navy-700">Total Reports</p>
                <p className="text-3xl font-bold text-navy">{reports.length}</p>
              </div>
              <div className="p-3 bg-navy-100 rounded-lg">
                <FileText className="h-6 w-6 text-navy" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-action-50 border-action-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-action-700">Rink A Today</p>
                <p className="text-xl font-bold text-action-800">
                  {rinkStatus['rink-a'] ? 'Submitted' : 'Pending'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${rinkStatus['rink-a'] ? 'bg-action-100' : 'bg-amber-100'}`}>
                <CheckCircle className={`h-6 w-6 ${rinkStatus['rink-a'] ? 'text-action' : 'text-amber-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Rink B Today</p>
                <p className="text-xl font-bold text-blue-800">
                  {rinkStatus['rink-b'] ? 'Submitted' : 'Pending'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${rinkStatus['rink-b'] ? 'bg-blue-100' : 'bg-amber-100'}`}>
                <CheckCircle className={`h-6 w-6 ${rinkStatus['rink-b'] ? 'text-blue-600' : 'text-amber-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card>
        <CardHeader title="Report History" />
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-wolf-500">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center">
              <Moon className="h-12 w-12 text-wolf-300 mx-auto mb-3" />
              <p className="text-wolf-600 font-medium">No end of day reports yet</p>
              <p className="text-sm text-wolf-500 mt-1">
                Submit your first report to track daily operations
              </p>
            </div>
          ) : (
            <div className="divide-y divide-wolf-100">
              {reports.map((report) => {
                const checkedCount = Object.values(report.checklist_items).filter(Boolean).length;
                const totalItems = Object.keys(report.checklist_items).length;
                return (
                  <div key={report.id} className="p-4 hover:bg-wolf-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-navy-100 rounded-lg">
                          <Moon className="h-5 w-5 text-navy" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-navy">
                              {getRinkName(report.rink_id)}
                            </span>
                            <Badge variant="info">{report.date}</Badge>
                          </div>
                          <p className="text-sm text-wolf-600">
                            {formatDate(report.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-wolf-500">Ice Makes</p>
                          <p className="font-medium text-action">{report.total_ice_makes}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-wolf-500">Checklist</p>
                          <p className="font-medium text-navy">
                            {checkedCount}/{totalItems}
                          </p>
                        </div>
                        {!report.synced && <Badge variant="warning">Pending Sync</Badge>}
                      </div>
                    </div>
                    {report.notes && (
                      <p className="mt-2 text-sm text-wolf-600 pl-14">{report.notes}</p>
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
