import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Select, Input } from '../../components/ui';
import { PercentageGauge, CutTypeToggle } from '../../components/ice-ops';
import { ArrowLeft, Save, Droplet, Trash2, Clock, Battery } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { saveIceMake, getTodayIceMakesCount } from '../../services/ice-make-service';
import type { CutType } from '../../types';

export function IceMakeNew() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { user } = useAuth();

  // Form state
  const [selectedRink, setSelectedRink] = useState('');
  const [selectedResurfacer, setSelectedResurfacer] = useState('');
  const [waterUsed, setWaterUsed] = useState(75);
  const [snowInTank, setSnowInTank] = useState(25);
  const [cutType, setCutType] = useState<CutType>('wet');
  const [batteryStart, setBatteryStart] = useState<number | undefined>(undefined);
  const [batteryEnd, setBatteryEnd] = useState<number | undefined>(undefined);
  const [hourMeter, setHourMeter] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Stats
  const [todayCount, setTodayCount] = useState(0);

  // Demo options (would come from facility config in real app)
  const rinkOptions = [
    { value: 'rink-a', label: 'Rink A - Main Arena' },
    { value: 'rink-b', label: 'Rink B - Practice Rink' },
  ];

  const resurfacerOptions = [
    { value: 'z1', label: 'Zamboni #1 (Electric)', fuelType: 'electric' },
    { value: 'z2', label: 'Zamboni #2 (Propane)', fuelType: 'propane' },
  ];

  const selectedMachine = resurfacerOptions.find((r) => r.value === selectedResurfacer);
  const isElectric = selectedMachine?.fuelType === 'electric';

  // Load today's count
  useEffect(() => {
    getTodayIceMakesCount(selectedRink || undefined).then(setTodayCount);
  }, [selectedRink]);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRink || !selectedResurfacer) {
      showError('Missing Information', 'Please select a rink and resurfacer.');
      return;
    }

    setIsSubmitting(true);

    try {
      await saveIceMake(
        {
          rink_id: selectedRink,
          resurfacer_id: selectedResurfacer,
          water_used_percent: waterUsed,
          snow_in_tank_percent: snowInTank,
          cut_type: cutType,
          battery_start_percent: isElectric ? batteryStart : undefined,
          battery_end_percent: isElectric ? batteryEnd : undefined,
          hour_meter_reading: hourMeter ? parseFloat(hourMeter) : undefined,
          notes: notes || undefined,
        },
        user?.id || 'demo-user',
        user?.facility_id || 'demo-facility'
      );

      success('Ice Make Logged', 'Resurfacing has been recorded successfully.');
      navigate('/ice-ops');
    } catch (err) {
      showError('Save Failed', 'Failed to log ice make. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-navy">Log Ice Make</h1>
            <p className="text-wolf-600 mt-1">Record resurfacer run details</p>
          </div>
        </div>

        {/* Today's count badge */}
        <div className="bg-action-50 text-action-700 px-4 py-2 rounded-lg">
          <span className="text-sm font-medium">Today's Ice Makes:</span>
          <span className="text-xl font-bold ml-2">{todayCount}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Machine selection & timer */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Machine Selection" />
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
                  label="Resurfacer"
                  options={resurfacerOptions}
                  value={selectedResurfacer}
                  onChange={(e) => setSelectedResurfacer(e.target.value)}
                  placeholder="Select resurfacer"
                  required
                />
              </CardContent>
            </Card>

            {/* Timer */}
            <Card>
              <CardHeader
                title="Run Timer"
                description="Optional: Track resurfacing duration"
              />
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-navy">
                    {formatTimer(timerSeconds)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={timerRunning ? 'danger' : 'primary'}
                    className="flex-1"
                    leftIcon={<Clock className="h-4 w-4" />}
                    onClick={() => setTimerRunning(!timerRunning)}
                  >
                    {timerRunning ? 'Stop' : 'Start'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerSeconds(0);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hour meter (optional) */}
            <Card>
              <CardHeader
                title="Hour Meter"
                description="Current reading (optional)"
              />
              <CardContent>
                <Input
                  label="Hour Meter Reading"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 1234.5"
                  value={hourMeter}
                  onChange={(e) => setHourMeter(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Middle column - Gauges */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Water & Snow Levels" />
              <CardContent className="space-y-6">
                <PercentageGauge
                  label="Water Used"
                  value={waterUsed}
                  onChange={setWaterUsed}
                  color="blue"
                  icon={<Droplet className="h-4 w-4" />}
                />
                <PercentageGauge
                  label="Snow in Tank"
                  value={snowInTank}
                  onChange={setSnowInTank}
                  color="brown"
                  icon={<Trash2 className="h-4 w-4" />}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Cut Type" />
              <CardContent>
                <CutTypeToggle value={cutType} onChange={setCutType} />
              </CardContent>
            </Card>
          </div>

          {/* Right column - Battery (if electric) & Notes */}
          <div className="space-y-6">
            {isElectric && (
              <Card>
                <CardHeader
                  title="Battery Levels"
                  description="Electric machine battery tracking"
                />
                <CardContent className="space-y-6">
                  <PercentageGauge
                    label="Battery Start"
                    value={batteryStart ?? 100}
                    onChange={setBatteryStart}
                    color="green"
                    icon={<Battery className="h-4 w-4" />}
                  />
                  <PercentageGauge
                    label="Battery End"
                    value={batteryEnd ?? 80}
                    onChange={setBatteryEnd}
                    color="yellow"
                    icon={<Battery className="h-4 w-4" />}
                  />
                  {batteryStart !== undefined && batteryEnd !== undefined && (
                    <div className="p-3 bg-wolf-50 rounded-lg text-center">
                      <p className="text-xs text-wolf-600">Battery Used</p>
                      <p className="text-xl font-bold text-navy">
                        {batteryStart - batteryEnd}%
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader title="Notes" description="Optional observations" />
              <CardContent>
                <textarea
                  className="w-full px-3 py-2 border border-wolf-300 rounded-lg focus:ring-2 focus:ring-action focus:border-action resize-none"
                  rows={4}
                  placeholder="Ice conditions, issues noticed, etc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardFooter>
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  leftIcon={<Save className="h-4 w-4" />}
                  isLoading={isSubmitting}
                >
                  Log Ice Make
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
