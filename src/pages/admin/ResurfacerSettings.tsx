import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, Badge } from '../../components/ui';
import { ArrowLeft, Plus, Edit2, Trash2, Snowflake } from 'lucide-react';

export function ResurfacerSettings() {
  const navigate = useNavigate();

  // Demo data
  const resurfacers = [
    {
      id: '1',
      name: 'Zamboni #1',
      make: 'Zamboni',
      model: '552',
      year: 2020,
      fuel_type: 'electric',
      hour_meter_reading: 1245.5,
      assigned_rinks: ['Rink A'],
      is_active: true,
    },
    {
      id: '2',
      name: 'Olympia #2',
      make: 'Olympia',
      model: 'Ice Bear',
      year: 2018,
      fuel_type: 'gas',
      hour_meter_reading: 2150.2,
      assigned_rinks: ['Rink B'],
      is_active: true,
    },
    {
      id: '3',
      name: 'Zamboni #3',
      make: 'Zamboni',
      model: '450',
      year: 2015,
      fuel_type: 'propane',
      hour_meter_reading: 3500.8,
      assigned_rinks: ['Rink A', 'Rink B'],
      is_active: false,
    },
  ];

  const getFuelTypeBadgeVariant = (fuelType: string) => {
    switch (fuelType) {
      case 'electric':
        return 'ideal';
      case 'gas':
        return 'warning';
      case 'propane':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-navy">Resurfacer Management</h1>
            <p className="text-wolf-600 mt-1">Manage ice resurfacer inventory</p>
          </div>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>Add Resurfacer</Button>
      </div>

      {/* Resurfacers list */}
      <Card>
        <CardHeader
          title="Resurfacers"
          description={`${resurfacers.filter((r) => r.is_active).length} active units`}
        />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-wolf-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Make/Model</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Year</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Fuel Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Hours</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Assigned</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-navy">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resurfacers.map((resurfacer) => (
                  <tr
                    key={resurfacer.id}
                    className="border-b border-wolf-100 hover:bg-wolf-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-navy">{resurfacer.name}</td>
                    <td className="py-3 px-4 text-sm text-wolf-600">
                      {resurfacer.make} {resurfacer.model}
                    </td>
                    <td className="py-3 px-4 text-sm text-wolf-600">{resurfacer.year}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getFuelTypeBadgeVariant(resurfacer.fuel_type)}>
                        {resurfacer.fuel_type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-wolf-600">
                      {resurfacer.hour_meter_reading.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-sm text-wolf-600">
                      {resurfacer.assigned_rinks.join(', ')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={resurfacer.is_active ? 'ideal' : 'default'}>
                        {resurfacer.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-danger hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {resurfacers.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Snowflake className="h-12 w-12 text-wolf-400 mx-auto mb-4" />
              <h3 className="text-lg font-display font-semibold text-navy mb-2">
                No resurfacers configured
              </h3>
              <p className="text-wolf-600 mb-4">Add your first resurfacer to get started.</p>
              <Button leftIcon={<Plus className="h-4 w-4" />}>Add Resurfacer</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
