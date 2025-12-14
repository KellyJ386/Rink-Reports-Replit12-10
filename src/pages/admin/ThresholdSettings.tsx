import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Input } from '../../components/ui';
import { ArrowLeft, Save, Ruler, Scissors, Droplet, Battery } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { getThresholds, saveThresholds, type ThresholdSettings } from '../../services/admin-service';

export function ThresholdSettings() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [thresholds, setThresholds] = useState<ThresholdSettings>({
    ice_depth: {
      ideal_min_mm: 25.4,
      ideal_max_mm: 44.45,
      warning_min_mm: 19.05,
      warning_max_mm: 50.8,
    },
    blade_life: {
      target_hours: 25,
      warning_hours: 30,
    },
    water_usage: {
      max_per_resurface_percent: 100,
    },
    battery: {
      low_warning_percent: 20,
    },
  });

  useEffect(() => {
    async function loadThresholds() {
      const data = await getThresholds();
      setThresholds(data);
      setIsLoading(false);
    }
    loadThresholds();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (thresholds.ice_depth.ideal_min_mm >= thresholds.ice_depth.ideal_max_mm) {
      showError('Invalid Range', 'Ideal minimum must be less than ideal maximum.');
      return;
    }

    if (thresholds.ice_depth.warning_min_mm >= thresholds.ice_depth.warning_max_mm) {
      showError('Invalid Range', 'Warning minimum must be less than warning maximum.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveThresholds(thresholds);
      success('Settings Saved', 'Threshold settings have been updated.');
    } catch {
      showError('Save Failed', 'Failed to save threshold settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateIceDepth = (field: keyof ThresholdSettings['ice_depth'], value: number) => {
    setThresholds((prev) => ({
      ...prev,
      ice_depth: { ...prev.ice_depth, [field]: value },
    }));
  };

  const updateBladeLife = (field: keyof ThresholdSettings['blade_life'], value: number) => {
    setThresholds((prev) => ({
      ...prev,
      blade_life: { ...prev.blade_life, [field]: value },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-wolf-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">Threshold Settings</h1>
          <p className="text-wolf-600 mt-1">Configure alert thresholds and target values</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ice Depth Thresholds */}
          <Card>
            <CardHeader
              title="Ice Depth Thresholds"
              description="Define acceptable ice depth ranges"
            />
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-navy rounded-lg">
                  <Ruler className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="p-4 bg-action-50 rounded-lg space-y-4">
                    <h4 className="font-medium text-action-800">Ideal Range (Green)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Minimum (mm)"
                        type="number"
                        step="0.01"
                        value={thresholds.ice_depth.ideal_min_mm}
                        onChange={(e) => updateIceDepth('ideal_min_mm', parseFloat(e.target.value))}
                        required
                      />
                      <Input
                        label="Maximum (mm)"
                        type="number"
                        step="0.01"
                        value={thresholds.ice_depth.ideal_max_mm}
                        onChange={(e) => updateIceDepth('ideal_max_mm', parseFloat(e.target.value))}
                        required
                      />
                    </div>
                    <p className="text-xs text-action-700">
                      {(thresholds.ice_depth.ideal_min_mm / 25.4).toFixed(2)}" -{' '}
                      {(thresholds.ice_depth.ideal_max_mm / 25.4).toFixed(2)}"
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg space-y-4">
                    <h4 className="font-medium text-amber-800">Warning Range (Yellow)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Minimum (mm)"
                        type="number"
                        step="0.01"
                        value={thresholds.ice_depth.warning_min_mm}
                        onChange={(e) => updateIceDepth('warning_min_mm', parseFloat(e.target.value))}
                        required
                      />
                      <Input
                        label="Maximum (mm)"
                        type="number"
                        step="0.01"
                        value={thresholds.ice_depth.warning_max_mm}
                        onChange={(e) => updateIceDepth('warning_max_mm', parseFloat(e.target.value))}
                        required
                      />
                    </div>
                    <p className="text-xs text-amber-700">
                      {(thresholds.ice_depth.warning_min_mm / 25.4).toFixed(2)}" -{' '}
                      {(thresholds.ice_depth.warning_max_mm / 25.4).toFixed(2)}"
                    </p>
                  </div>

                  <p className="text-sm text-wolf-500">
                    Values outside warning range will show as critical (red).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blade Life Thresholds */}
          <Card>
            <CardHeader
              title="Blade Life Settings"
              description="Blade change reminders and targets"
            />
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Scissors className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 space-y-4">
                  <Input
                    label="Target Blade Life (hours)"
                    type="number"
                    step="1"
                    value={thresholds.blade_life.target_hours}
                    onChange={(e) => updateBladeLife('target_hours', parseInt(e.target.value))}
                    required
                  />
                  <p className="text-sm text-wolf-500">
                    Recommended hours between blade changes.
                  </p>

                  <Input
                    label="Warning Threshold (hours)"
                    type="number"
                    step="1"
                    value={thresholds.blade_life.warning_hours}
                    onChange={(e) => updateBladeLife('warning_hours', parseInt(e.target.value))}
                    required
                  />
                  <p className="text-sm text-wolf-500">
                    Show warning when blade exceeds this many hours.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Water Usage */}
          <Card>
            <CardHeader
              title="Water Usage"
              description="Water tank thresholds"
            />
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Droplet className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 space-y-4">
                  <Input
                    label="Max Water Per Resurface (%)"
                    type="number"
                    min="0"
                    max="100"
                    value={thresholds.water_usage.max_per_resurface_percent}
                    onChange={(e) =>
                      setThresholds((prev) => ({
                        ...prev,
                        water_usage: { max_per_resurface_percent: parseInt(e.target.value) },
                      }))
                    }
                    required
                  />
                  <p className="text-sm text-wolf-500">
                    Alert if water usage exceeds this percentage per run.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Battery Settings */}
          <Card>
            <CardHeader
              title="Battery Settings"
              description="Electric resurfacer battery alerts"
            />
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-action rounded-lg">
                  <Battery className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 space-y-4">
                  <Input
                    label="Low Battery Warning (%)"
                    type="number"
                    min="0"
                    max="100"
                    value={thresholds.battery.low_warning_percent}
                    onChange={(e) =>
                      setThresholds((prev) => ({
                        ...prev,
                        battery: { low_warning_percent: parseInt(e.target.value) },
                      }))
                    }
                    required
                  />
                  <p className="text-sm text-wolf-500">
                    Show warning when battery drops below this level.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="lg:col-span-2">
            <Card>
              <CardFooter className="border-t-0 pt-0">
                <Button variant="secondary" onClick={() => navigate('/admin')}>
                  Cancel
                </Button>
                <Button type="submit" leftIcon={<Save className="h-4 w-4" />} isLoading={isSubmitting}>
                  Save Thresholds
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
