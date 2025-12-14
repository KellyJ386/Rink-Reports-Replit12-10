import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Select, Input } from '../../components/ui';
import { ArrowLeft, Save, Bluetooth } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export function IceDepthNew() {
  const navigate = useNavigate();
  const { success } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Demo rink and template options
  const rinkOptions = [
    { value: 'rink-a', label: 'Rink A - Main Arena' },
    { value: 'rink-b', label: 'Rink B - Practice Rink' },
  ];

  const templateOptions = [
    { value: '25-point', label: '25-Point Grid' },
    { value: '35-point', label: '35-Point Grid' },
    { value: '47-point', label: '47-Point Grid' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    success('Measurement saved', 'Ice depth measurement has been recorded.');
    navigate('/ice-depth');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">New Ice Depth Measurement</h1>
          <p className="text-wolf-600 mt-1">Record ice thickness measurements</p>
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
                  placeholder="Select a rink"
                  required
                />
                <Select
                  label="Measurement Template"
                  options={templateOptions}
                  placeholder="Select template"
                  required
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Environmental Conditions" />
              <CardContent className="space-y-4">
                <Input label="Air Temperature (°C)" type="number" step="0.1" required />
                <Input label="Ice Temperature (°C)" type="number" step="0.1" required />
                <Input label="Humidity (%)" type="number" min="0" max="100" required />
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title="Bluetooth Caliper"
                description="Connect a digital caliper for automatic readings"
              />
              <CardContent>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  leftIcon={<Bluetooth className="h-4 w-4" />}
                >
                  Connect Device
                </Button>
                <p className="text-xs text-wolf-500 mt-2 text-center">
                  No device connected. Measurements will be entered manually.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Rink diagram */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader
                title="Rink Diagram"
                description="Click on measurement points to enter depth values"
              />
              <CardContent>
                {/* SVG Rink placeholder */}
                <div className="aspect-[2/1] bg-wolf-100 rounded-lg flex items-center justify-center border-2 border-dashed border-wolf-300">
                  <div className="text-center">
                    <p className="text-wolf-600 font-medium">Interactive Rink Diagram</p>
                    <p className="text-sm text-wolf-500 mt-1">
                      Select a rink and template to display measurement points
                    </p>
                  </div>
                </div>

                {/* Measurement progress */}
                <div className="mt-4 flex items-center justify-between p-3 bg-wolf-50 rounded-lg">
                  <span className="text-sm text-wolf-600">Progress</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-wolf-200 rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-action rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-navy">0/25 points</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" leftIcon={<Save className="h-4 w-4" />} isLoading={isSubmitting}>
                  Save Measurement
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
