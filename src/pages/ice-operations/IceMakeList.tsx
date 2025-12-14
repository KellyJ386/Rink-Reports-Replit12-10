import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, Badge } from '../../components/ui';
import { Plus, Filter, Download, Snowflake } from 'lucide-react';
import { formatTime } from '../../lib/utils';

export function IceMakeList() {
  // Demo data
  const iceMakes = [
    {
      id: '1',
      rink: 'Rink A',
      resurfacer: 'Zamboni #1',
      operator: 'John Smith',
      water_used: 65,
      snow_in_tank: 45,
      cut_type: 'wet',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      rink: 'Rink B',
      resurfacer: 'Olympia #2',
      operator: 'Jane Doe',
      water_used: 80,
      snow_in_tank: 60,
      cut_type: 'dry',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      rink: 'Rink A',
      resurfacer: 'Zamboni #1',
      operator: 'John Smith',
      water_used: 70,
      snow_in_tank: 55,
      cut_type: 'wet',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">Ice Operations</h1>
          <p className="text-wolf-600 mt-1">Track ice makes and resurfacing activities</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Filter className="h-4 w-4" />}>
            Filter
          </Button>
          <Button variant="secondary" leftIcon={<Download className="h-4 w-4" />}>
            Export
          </Button>
          <Link to="/ice-operations/ice-make/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Log Ice Make
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/ice-operations/circle-check/new">
          <Card hoverable>
            <CardContent className="py-4 text-center">
              <p className="font-display font-semibold text-navy">Circle Check</p>
              <p className="text-sm text-wolf-600 mt-1">Pre-operation inspection</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/ice-operations/blade-change/new">
          <Card hoverable>
            <CardContent className="py-4 text-center">
              <p className="font-display font-semibold text-navy">Blade Change</p>
              <p className="text-sm text-wolf-600 mt-1">Log blade replacement</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/ice-operations/end-of-day/new">
          <Card hoverable>
            <CardContent className="py-4 text-center">
              <p className="font-display font-semibold text-navy">End of Day</p>
              <p className="text-sm text-wolf-600 mt-1">Daily summary report</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Ice makes list */}
      <Card>
        <CardHeader title="Recent Ice Makes" description="Today's resurfacing activities" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-wolf-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Rink</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Resurfacer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Water Used</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Snow</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Cut Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Operator</th>
                </tr>
              </thead>
              <tbody>
                {iceMakes.map((make) => (
                  <tr key={make.id} className="border-b border-wolf-100 hover:bg-wolf-50">
                    <td className="py-3 px-4 text-sm text-navy">{formatTime(make.created_at)}</td>
                    <td className="py-3 px-4 text-sm text-navy font-medium">{make.rink}</td>
                    <td className="py-3 px-4 text-sm text-wolf-600">{make.resurfacer}</td>
                    <td className="py-3 px-4 text-sm text-wolf-600">{make.water_used}%</td>
                    <td className="py-3 px-4 text-sm text-wolf-600">{make.snow_in_tank}%</td>
                    <td className="py-3 px-4">
                      <Badge variant={make.cut_type === 'wet' ? 'info' : 'default'}>
                        {make.cut_type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-wolf-600">{make.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {iceMakes.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Snowflake className="h-12 w-12 text-wolf-400 mx-auto mb-4" />
              <h3 className="text-lg font-display font-semibold text-navy mb-2">
                No ice makes today
              </h3>
              <p className="text-wolf-600 mb-4">Log your first ice make to get started.</p>
              <Link to="/ice-operations/ice-make/new">
                <Button leftIcon={<Plus className="h-4 w-4" />}>
                  Log Ice Make
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
