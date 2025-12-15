import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, IceDepthBadge } from '../../components/ui';
import { Plus, Filter, Download, Ruler } from 'lucide-react';
import { formatDate, formatDepth, getIceDepthStatus } from '../../lib/utils';

// Demo data - computed once outside component to avoid impure function calls during render
const DEMO_MEASUREMENTS = [
  {
    id: '1',
    rink: 'Rink A',
    template: '25-Point',
    avg_depth: 32.5,
    min_depth: 28.2,
    max_depth: 38.1,
    checked_at: '2024-12-15T10:00:00.000Z',
    technician: 'John Smith',
  },
  {
    id: '2',
    rink: 'Rink B',
    template: '35-Point',
    avg_depth: 22.1,
    min_depth: 18.5,
    max_depth: 26.8,
    checked_at: '2024-12-14T10:00:00.000Z',
    technician: 'Jane Doe',
  },
  {
    id: '3',
    rink: 'Rink A',
    template: '25-Point',
    avg_depth: 35.2,
    min_depth: 31.0,
    max_depth: 40.5,
    checked_at: '2024-12-13T10:00:00.000Z',
    technician: 'John Smith',
  },
];

export function IceDepthList() {
  const measurements = DEMO_MEASUREMENTS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">Ice Depth Measurements</h1>
          <p className="text-wolf-600 mt-1">Track and monitor ice thickness across all rinks</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Filter className="h-4 w-4" />}>
            Filter
          </Button>
          <Button variant="secondary" leftIcon={<Download className="h-4 w-4" />}>
            Export
          </Button>
          <Link to="/ice-depth/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              New Measurement
            </Button>
          </Link>
        </div>
      </div>

      {/* Measurements list */}
      <Card>
        <CardHeader title="Recent Measurements" description="Latest ice depth checks" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-wolf-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Rink</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Template</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Avg Depth</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Range</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Technician</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-navy">Actions</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.id} className="border-b border-wolf-100 hover:bg-wolf-50">
                    <td className="py-3 px-4 text-sm text-navy font-medium">{m.rink}</td>
                    <td className="py-3 px-4 text-sm text-wolf-600">{m.template}</td>
                    <td className="py-3 px-4 text-sm text-navy font-medium">
                      {formatDepth(m.avg_depth)}
                    </td>
                    <td className="py-3 px-4 text-sm text-wolf-600">
                      {formatDepth(m.min_depth)} - {formatDepth(m.max_depth)}
                    </td>
                    <td className="py-3 px-4">
                      <IceDepthBadge status={getIceDepthStatus(m.avg_depth)} />
                    </td>
                    <td className="py-3 px-4 text-sm text-wolf-600">{formatDate(m.checked_at)}</td>
                    <td className="py-3 px-4 text-sm text-wolf-600">{m.technician}</td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/ice-depth/${m.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Empty state (commented out, shown when no data) */}
      {measurements.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Ruler className="h-12 w-12 text-wolf-400 mx-auto mb-4" />
              <h3 className="text-lg font-display font-semibold text-navy mb-2">
                No measurements yet
              </h3>
              <p className="text-wolf-600 mb-4">
                Start tracking ice depth by taking your first measurement.
              </p>
              <Link to="/ice-depth/new">
                <Button leftIcon={<Plus className="h-4 w-4" />}>
                  New Measurement
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
