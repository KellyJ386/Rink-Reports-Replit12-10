import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Select, Input } from '../../components/ui';
import { ArrowLeft, Save, Scissors, Gauge, Clock } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { saveBladeChange, getBladeChangesByResurfacer, getAverageBladeLife } from '../../services/blade-change-service';
import type { BladeChangeReason } from '../../types';

export function BladeChangeNew() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { user } = useAuth();

  const [selectedResurfacer, setSelectedResurfacer] = useState('');
  const [hourMeter, setHourMeter] = useState('');
  const [reason, setReason] = useState<BladeChangeReason>('scheduled');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const [lastChangeHours, setLastChangeHours] = useState<number | null>(null);
  const [avgBladeLife, setAvgBladeLife] = useState<number>(0);

  const resurfacerOptions = [
    { value: 'z1', label: 'Zamboni #1 (Electric)' },
    { value: 'z2', label: 'Zamboni #2 (Propane)' },
  ];

  const reasonOptions = [
    { value: 'scheduled', label: 'Scheduled Maintenance' },
    { value: 'wear', label: 'Normal Wear' },
    { value: 'damage', label: 'Blade Damage' },
    { value: 'quality_issues', label: 'Ice Quality Issues' },
  ];

  // Load stats when resurfacer changes
  useEffect(() => {
    async function loadStats() {
      if (!selectedResurfacer) {
        setLastChangeHours(null);
        setAvgBladeLife(0);
        return;
      }

      const [changes, avgLife] = await Promise.all([
        getBladeChangesByResurfacer(selectedResurfacer),
        getAverageBladeLife(selectedResurfacer),
      ]);

      if (changes.length > 0) {
        setLastChangeHours(changes[0].hour_meter_reading);
      } else {
        setLastChangeHours(null);
      }
      setAvgBladeLife(avgLife);
    }
    loadStats();
  }, [selectedResurfacer]);

  const hoursSinceLastChange = lastChangeHours !== null && hourMeter
    ? parseFloat(hourMeter) - lastChangeHours
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResurfacer) {
      showError('Missing Information', 'Please select a resurfacer.');
      return;
    }

    if (!hourMeter) {
      showError('Missing Information', 'Please enter the current hour meter reading.');
      return;
    }

    setIsSubmitting(true);

    try {
      await saveBladeChange(
        {
          resurfacer_id: selectedResurfacer,
          hour_meter_reading: parseFloat(hourMeter),
          reason,
          notes: notes || undefined,
        },
        user?.id || 'demo-user',
        user?.facility_id || 'demo-facility'
      );

      success('Blade Change Logged', 'Blade change has been recorded successfully.');
      navigate('/ice-ops/blade-changes');
    } catch (err) {
      showError('Save Failed', 'Failed to log blade change. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">Log Blade Change</h1>
          <p className="text-wolf-600 mt-1">Record blade replacement details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Blade Change Details" />
              <CardContent className="space-y-4">
                <Select
                  label="Resurfacer"
                  options={resurfacerOptions}
                  value={selectedResurfacer}
                  onChange={(e) => setSelectedResurfacer(e.target.value)}
                  placeholder="Select resurfacer"
                  required
                />
                <Input
                  label="Current Hour Meter Reading"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 1234.5"
                  value={hourMeter}
                  onChange={(e) => setHourMeter(e.target.value)}
                  required
                />
                <Select
                  label="Reason for Change"
                  options={reasonOptions}
                  value={reason}
                  onChange={(e) => setReason(e.target.value as BladeChangeReason)}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border border-wolf-300 rounded-lg focus:ring-2 focus:ring-action focus:border-action resize-none"
                    rows={3}
                    placeholder="Blade condition, new blade details, etc..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
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
                >
                  Log Blade Change
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right column - Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Blade Statistics" />
              <CardContent className="space-y-4">
                {selectedResurfacer ? (
                  <>
                    <div className="p-4 bg-wolf-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-navy rounded-lg">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-wolf-600">Last Blade Change</p>
                          <p className="text-xl font-bold text-navy">
                            {lastChangeHours !== null ? `${lastChangeHours} hrs` : 'No record'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {hoursSinceLastChange !== null && hoursSinceLastChange > 0 && (
                      <div className="p-4 bg-action-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-action rounded-lg">
                            <Scissors className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-action-700">Hours on Current Blade</p>
                            <p className="text-xl font-bold text-action-800">
                              {hoursSinceLastChange.toFixed(1)} hrs
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Gauge className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Average Blade Life</p>
                          <p className="text-xl font-bold text-blue-800">
                            {avgBladeLife > 0 ? `${avgBladeLife} hrs` : 'Not enough data'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-wolf-500">
                    <Scissors className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select a resurfacer to see blade statistics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
