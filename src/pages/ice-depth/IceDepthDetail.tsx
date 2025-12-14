import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button, IceDepthBadge } from '../../components/ui';
import { ArrowLeft, Download, Printer, Thermometer, Droplets } from 'lucide-react';
import { formatDate, formatTime, formatDepth, formatTemperature, getIceDepthStatus } from '../../lib/utils';

export function IceDepthDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Demo data
  const measurement = {
    id,
    rink: 'Rink A - Main Arena',
    template: '25-Point Grid',
    technician: 'John Smith',
    checked_at: new Date().toISOString(),
    air_temp_c: 18.5,
    ice_temp_c: -4.2,
    humidity: 45,
    avg_depth: 32.5,
    min_depth: 28.2,
    max_depth: 38.1,
    notes: 'Regular weekly measurement. Ice conditions good overall.',
    measurements: {
      '1': 32.1, '2': 31.5, '3': 33.2, '4': 30.8, '5': 32.5,
      '6': 34.1, '7': 33.5, '8': 35.2, '9': 32.8, '10': 34.5,
      '11': 32.1, '12': 31.5, '13': 38.1, '14': 28.2, '15': 32.5,
      '16': 34.1, '17': 33.5, '18': 35.2, '19': 32.8, '20': 34.5,
      '21': 32.1, '22': 31.5, '23': 33.2, '24': 30.8, '25': 32.5,
    },
  };

  const zoneStats = [
    { name: 'North Goal', avg: 31.8, status: 'ideal' as const },
    { name: 'North Blue', avg: 34.2, status: 'ideal' as const },
    { name: 'Center Ice', avg: 32.5, status: 'ideal' as const },
    { name: 'South Blue', avg: 33.8, status: 'ideal' as const },
    { name: 'South Goal', avg: 32.0, status: 'ideal' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-navy">Measurement Details</h1>
            <p className="text-wolf-600 mt-1">{measurement.rink}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Printer className="h-4 w-4" />}>
            Print
          </Button>
          <Button variant="secondary" leftIcon={<Download className="h-4 w-4" />}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-wolf-600">Average Depth</p>
            <p className="text-2xl font-display font-bold text-navy mt-1">
              {formatDepth(measurement.avg_depth)}
            </p>
            <IceDepthBadge status={getIceDepthStatus(measurement.avg_depth)} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-wolf-600">Depth Range</p>
            <p className="text-2xl font-display font-bold text-navy mt-1">
              {formatDepth(measurement.min_depth)} - {formatDepth(measurement.max_depth)}
            </p>
            <p className="text-sm text-wolf-500 mt-2">
              Variance: {formatDepth(measurement.max_depth - measurement.min_depth)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-wolf-600">
              <Thermometer className="h-4 w-4" />
              <span className="text-sm">Temperature</span>
            </div>
            <p className="text-lg font-medium text-navy mt-2">
              Air: {formatTemperature(measurement.air_temp_c)}
            </p>
            <p className="text-lg font-medium text-navy">
              Ice: {formatTemperature(measurement.ice_temp_c)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-wolf-600">
              <Droplets className="h-4 w-4" />
              <span className="text-sm">Humidity</span>
            </div>
            <p className="text-2xl font-display font-bold text-navy mt-1">
              {measurement.humidity}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rink diagram */}
        <Card className="lg:col-span-2">
          <CardHeader title="Measurement Map" description="Visual representation of ice depth" />
          <CardContent>
            {/* SVG Rink placeholder */}
            <div className="aspect-[2/1] bg-wolf-100 rounded-lg flex items-center justify-center border-2 border-dashed border-wolf-300">
              <div className="text-center">
                <p className="text-wolf-600 font-medium">Interactive Rink Diagram</p>
                <p className="text-sm text-wolf-500 mt-1">
                  Heat map showing ice depth distribution
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone summary */}
        <Card>
          <CardHeader title="Zone Summary" description="Average depth by zone" />
          <CardContent>
            <div className="space-y-3">
              {zoneStats.map((zone) => (
                <div
                  key={zone.name}
                  className="flex items-center justify-between p-3 bg-wolf-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-navy">{zone.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-wolf-600">{formatDepth(zone.avg)}</span>
                    <IceDepthBadge status={zone.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Card>
        <CardHeader title="Measurement Information" />
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <dt className="text-sm text-wolf-600">Date</dt>
              <dd className="text-sm font-medium text-navy mt-1">
                {formatDate(measurement.checked_at)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-wolf-600">Time</dt>
              <dd className="text-sm font-medium text-navy mt-1">
                {formatTime(measurement.checked_at)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-wolf-600">Template</dt>
              <dd className="text-sm font-medium text-navy mt-1">{measurement.template}</dd>
            </div>
            <div>
              <dt className="text-sm text-wolf-600">Technician</dt>
              <dd className="text-sm font-medium text-navy mt-1">{measurement.technician}</dd>
            </div>
          </dl>
          {measurement.notes && (
            <div className="mt-4 pt-4 border-t border-wolf-200">
              <dt className="text-sm text-wolf-600">Notes</dt>
              <dd className="text-sm text-navy mt-1">{measurement.notes}</dd>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
