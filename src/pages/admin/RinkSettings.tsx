import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, Badge } from '../../components/ui';
import { ArrowLeft, Plus, Edit2, Trash2, Gauge } from 'lucide-react';

export function RinkSettings() {
  const navigate = useNavigate();

  // Demo data
  const rinks = [
    {
      id: '1',
      name: 'Rink A - Main Arena',
      length_ft: 200,
      width_ft: 85,
      primary_use: 'hockey',
      measurement_template: '25-point',
      target_depth_min: 25.4,
      target_depth_max: 44.45,
      is_active: true,
    },
    {
      id: '2',
      name: 'Rink B - Practice Rink',
      length_ft: 200,
      width_ft: 85,
      primary_use: 'multi_use',
      measurement_template: '35-point',
      target_depth_min: 25.4,
      target_depth_max: 44.45,
      is_active: true,
    },
  ];

  const formatPrimaryUse = (use: string) => {
    return use.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
            <h1 className="text-2xl font-display font-bold text-navy">Rink Configuration</h1>
            <p className="text-wolf-600 mt-1">Manage rinks and measurement templates</p>
          </div>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>Add Rink</Button>
      </div>

      {/* Rinks list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rinks.map((rink) => (
          <Card key={rink.id}>
            <CardHeader
              title={rink.name}
              action={
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-danger hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              }
            />
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-wolf-600">Dimensions</dt>
                  <dd className="text-sm font-medium text-navy">
                    {rink.length_ft}' x {rink.width_ft}'
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-wolf-600">Primary Use</dt>
                  <dd className="text-sm font-medium text-navy">
                    {formatPrimaryUse(rink.primary_use)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-wolf-600">Measurement Template</dt>
                  <dd className="text-sm font-medium text-navy">{rink.measurement_template}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-wolf-600">Target Depth Range</dt>
                  <dd className="text-sm font-medium text-navy">
                    {rink.target_depth_min}mm - {rink.target_depth_max}mm
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-wolf-600">Status</dt>
                  <dd>
                    <Badge variant={rink.is_active ? 'ideal' : 'default'}>
                      {rink.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {rinks.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Gauge className="h-12 w-12 text-wolf-400 mx-auto mb-4" />
              <h3 className="text-lg font-display font-semibold text-navy mb-2">No rinks configured</h3>
              <p className="text-wolf-600 mb-4">Add your first rink to get started.</p>
              <Button leftIcon={<Plus className="h-4 w-4" />}>Add Rink</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
