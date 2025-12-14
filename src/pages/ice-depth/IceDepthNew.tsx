import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Select, Input } from '../../components/ui';
import { ArrowLeft, Save, Bluetooth, BluetoothConnected, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { InteractiveRinkDiagram, MeasurementEntryModal, getTemplate, type MeasurementPoint } from '../../components/ice-depth';
import { useBluetooth } from '../../hooks/useBluetooth';
import { saveMeasurement } from '../../services/ice-depth-service';
import type { MeasurementMethod, MeasurementTemplate } from '../../types';

export function IceDepthNew() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { user } = useAuth();

  // Form state
  const [selectedRink, setSelectedRink] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<MeasurementTemplate>('25-point');
  const [airTemp, setAirTemp] = useState('');
  const [iceTemp, setIceTemp] = useState('');
  const [humidity, setHumidity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Measurement state
  const [measurements, setMeasurements] = useState<Record<string, number>>({});
  const [measurementMethods, setMeasurementMethods] = useState<Record<string, MeasurementMethod>>({});
  const [selectedPoint, setSelectedPoint] = useState<MeasurementPoint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unit, setUnit] = useState<'mm' | 'in'>('mm');
  const [showHeatMap, setShowHeatMap] = useState(true);

  // Bluetooth
  const bluetooth = useBluetooth();

  // Demo rink options
  const rinkOptions = [
    { value: 'rink-a', label: 'Rink A - Main Arena' },
    { value: 'rink-b', label: 'Rink B - Practice Rink' },
  ];

  const templateOptions = [
    { value: '25-point', label: '25-Point Grid' },
    { value: '35-point', label: '35-Point Grid' },
    { value: '47-point', label: '47-Point Grid' },
  ];

  // Get current template points
  const templatePoints = useMemo(() => {
    return getTemplate(selectedTemplate);
  }, [selectedTemplate]);

  // Progress calculation
  const completedCount = Object.keys(measurements).length;
  const totalCount = templatePoints.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Handle point click on diagram
  const handlePointClick = useCallback((point: MeasurementPoint) => {
    setSelectedPoint(point);
    setIsModalOpen(true);
  }, []);

  // Handle saving a measurement
  const handleSaveMeasurement = useCallback((pointId: string, value: number) => {
    setMeasurements((prev) => ({ ...prev, [pointId]: value }));
    setMeasurementMethods((prev) => ({
      ...prev,
      [pointId]: bluetooth.isConnected ? 'bluetooth' : 'manual',
    }));

    // Auto-advance to next point
    const currentIndex = templatePoints.findIndex((p) => p.id === pointId);
    if (currentIndex < templatePoints.length - 1) {
      const nextPoint = templatePoints[currentIndex + 1];
      // Check if next point already has a measurement
      if (!measurements[nextPoint.id]) {
        setTimeout(() => {
          setSelectedPoint(nextPoint);
          setIsModalOpen(true);
        }, 300);
      }
    }
  }, [bluetooth.isConnected, templatePoints, measurements]);

  // Handle template change
  const handleTemplateChange = useCallback((value: string) => {
    setSelectedTemplate(value as MeasurementTemplate);
    // Clear measurements when template changes
    setMeasurements({});
    setMeasurementMethods({});
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedRink) {
      showError('Missing Information', 'Please select a rink.');
      return;
    }

    if (completedCount < totalCount) {
      showError('Incomplete Measurements', `Please complete all ${totalCount} measurement points.`);
      return;
    }

    if (!airTemp || !iceTemp || !humidity) {
      showError('Missing Information', 'Please enter all environmental conditions.');
      return;
    }

    setIsSubmitting(true);

    try {
      await saveMeasurement(
        {
          rink_id: selectedRink,
          template_id: selectedTemplate,
          measurements,
          measurementMethods,
          device_id: bluetooth.deviceName || undefined,
          air_temp_c: parseFloat(airTemp),
          ice_temp_c: parseFloat(iceTemp),
          humidity: parseFloat(humidity),
          notes: notes || undefined,
        },
        user?.id || 'demo-user',
        user?.facility_id || 'demo-facility'
      );

      success('Measurement Saved', 'Ice depth measurement has been recorded successfully.');
      navigate('/ice-depth');
    } catch (err) {
      showError('Save Failed', 'Failed to save measurement. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clear all measurements
  const handleClearAll = useCallback(() => {
    setMeasurements({});
    setMeasurementMethods({});
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">New Ice Depth Measurement</h1>
          <p className="text-wolf-600 mt-1">Record ice thickness measurements across the rink</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Measurement Settings" />
              <CardContent className="space-y-4">
                <Select
                  label="Rink"
                  options={rinkOptions}
                  value={selectedRink}
                  onChange={(e) => setSelectedRink(e.target.value)}
                  placeholder="Select a rink"
                  required
                />
                <Select
                  label="Measurement Template"
                  options={templateOptions}
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  required
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Environmental Conditions" />
              <CardContent className="space-y-4">
                <Input
                  label="Air Temperature (°C)"
                  type="number"
                  step="0.1"
                  value={airTemp}
                  onChange={(e) => setAirTemp(e.target.value)}
                  required
                />
                <Input
                  label="Ice Temperature (°C)"
                  type="number"
                  step="0.1"
                  value={iceTemp}
                  onChange={(e) => setIceTemp(e.target.value)}
                  required
                />
                <Input
                  label="Humidity (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  required
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title="Bluetooth Caliper"
                description={bluetooth.isSupported ? 'Connect a digital caliper for automatic readings' : 'Not supported in this browser'}
              />
              <CardContent className="space-y-3">
                {bluetooth.isSupported ? (
                  <>
                    {bluetooth.isConnected ? (
                      <>
                        <div className="flex items-center justify-between p-3 bg-action-50 rounded-lg border border-action-200">
                          <div className="flex items-center gap-2">
                            <BluetoothConnected className="h-5 w-5 text-action" />
                            <div>
                              <p className="text-sm font-medium text-navy">{bluetooth.deviceName}</p>
                              <p className="text-xs text-wolf-600">Connected</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={bluetooth.disconnect}
                          >
                            Disconnect
                          </Button>
                        </div>
                        {bluetooth.lastReading !== null && (
                          <div className="p-3 bg-wolf-50 rounded-lg">
                            <p className="text-xs text-wolf-600 mb-1">Last Reading</p>
                            <p className="text-xl font-bold text-navy">
                              {bluetooth.lastReading.toFixed(2)} mm
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full"
                          leftIcon={<Bluetooth className="h-4 w-4" />}
                          onClick={bluetooth.connect}
                          isLoading={bluetooth.isConnecting}
                        >
                          {bluetooth.isConnecting ? 'Connecting...' : 'Connect Device'}
                        </Button>
                        {bluetooth.error && (
                          <p className="text-xs text-red-600 text-center">{bluetooth.error}</p>
                        )}
                        <p className="text-xs text-wolf-500 text-center">
                          Supports Mitutoyo, Starrett, iGaging and other BLE calipers
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-wolf-500 text-center">
                    Web Bluetooth is not supported in this browser. Use Chrome or Edge on desktop.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader title="Notes" description="Optional observations" />
              <CardContent>
                <textarea
                  className="w-full px-3 py-2 border border-wolf-300 rounded-lg focus:ring-2 focus:ring-action focus:border-action resize-none"
                  rows={3}
                  placeholder="Add any notes about ice conditions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right column - Rink diagram */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader
                title="Rink Diagram"
                description="Click on measurement points to enter depth values"
                action={
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHeatMap(!showHeatMap)}
                      leftIcon={showHeatMap ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    >
                      {showHeatMap ? 'Hide' : 'Show'} Heat Map
                    </Button>
                    {completedCount > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        leftIcon={<RefreshCw className="h-4 w-4" />}
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                }
              />
              <CardContent className="flex-1">
                {selectedRink ? (
                  <InteractiveRinkDiagram
                    templateName={selectedTemplate}
                    measurements={measurements}
                    onPointClick={handlePointClick}
                    selectedPointId={selectedPoint?.id}
                    showHeatMap={showHeatMap}
                    readOnly={false}
                  />
                ) : (
                  <div className="aspect-[2/1] bg-wolf-100 rounded-lg flex items-center justify-center border-2 border-dashed border-wolf-300">
                    <div className="text-center">
                      <p className="text-wolf-600 font-medium">Select a Rink</p>
                      <p className="text-sm text-wolf-500 mt-1">
                        Choose a rink from the settings to display the measurement diagram
                      </p>
                    </div>
                  </div>
                )}

                {/* Measurement progress */}
                <div className="mt-4 flex items-center justify-between p-3 bg-wolf-50 rounded-lg">
                  <span className="text-sm text-wolf-600">Progress</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-wolf-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-action rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-navy">
                      {completedCount}/{totalCount} points
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-wolf-600">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-action" />
                    <span>Ideal (1.0-1.75")</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Warning</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Critical</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full border-2 border-wolf-400 bg-white" />
                    <span>Not measured</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  leftIcon={<Save className="h-4 w-4" />}
                  isLoading={isSubmitting}
                  disabled={completedCount < totalCount || !selectedRink}
                >
                  Save Measurement
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>

      {/* Measurement Entry Modal */}
      <MeasurementEntryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPoint(null);
        }}
        point={selectedPoint}
        currentValue={selectedPoint ? measurements[selectedPoint.id] : undefined}
        onSave={handleSaveMeasurement}
        unit={unit}
        onUnitChange={setUnit}
        bluetoothValue={bluetooth.lastReading}
        isBluetoothConnected={bluetooth.isConnected}
      />
    </div>
  );
}
