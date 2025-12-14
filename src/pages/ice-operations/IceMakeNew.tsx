import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Select, Input, Toggle, TextArea } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export function IceMakeNew() {
  const navigate = useNavigate();
  const { success } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isElectric, setIsElectric] = useState(true);
  const [cutType, setCutType] = useState<'wet' | 'dry'>('wet');

  const rinkOptions = [
    { value: 'rink-a', label: 'Rink A - Main Arena' },
    { value: 'rink-b', label: 'Rink B - Practice Rink' },
  ];

  const resurfacerOptions = [
    { value: 'zamboni-1', label: 'Zamboni #1 (Electric)' },
    { value: 'olympia-2', label: 'Olympia #2 (Gas)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    success('Ice make logged', 'Resurfacing activity has been recorded.');
    navigate('/ice-operations');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">Log Ice Make</h1>
          <p className="text-wolf-600 mt-1">Record resurfacing activity</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic info */}
          <Card>
            <CardHeader title="Resurfacing Details" />
            <CardContent className="space-y-4">
              <Select label="Rink" options={rinkOptions} placeholder="Select a rink" required />
              <Select
                label="Resurfacer"
                options={resurfacerOptions}
                placeholder="Select resurfacer"
                required
              />
              <Input label="Water Used (%)" type="number" min="0" max="100" required />
              <Input label="Snow in Tank (%)" type="number" min="0" max="100" required />

              {/* Cut type toggle */}
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Cut Type</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCutType('wet')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                      cutType === 'wet'
                        ? 'border-navy bg-navy text-white'
                        : 'border-wolf-300 text-navy hover:border-wolf-400'
                    }`}
                  >
                    Wet Cut
                  </button>
                  <button
                    type="button"
                    onClick={() => setCutType('dry')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                      cutType === 'dry'
                        ? 'border-navy bg-navy text-white'
                        : 'border-wolf-300 text-navy hover:border-wolf-400'
                    }`}
                  >
                    Dry Cut
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Electric-specific fields */}
          <Card>
            <CardHeader
              title="Battery Information"
              description="For electric resurfacers only"
            />
            <CardContent className="space-y-4">
              <Toggle
                label="Electric Resurfacer"
                description="Enable to log battery levels"
                checked={isElectric}
                onChange={(e) => setIsElectric(e.target.checked)}
              />

              {isElectric && (
                <>
                  <Input label="Battery Start (%)" type="number" min="0" max="100" />
                  <Input label="Battery End (%)" type="number" min="0" max="100" />
                </>
              )}

              <Input label="Hour Meter Reading" type="number" step="0.1" />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="lg:col-span-2">
            <CardHeader title="Notes" description="Optional observations or comments" />
            <CardContent>
              <TextArea
                placeholder="Enter any notes about ice conditions, equipment issues, etc."
                rows={3}
              />
            </CardContent>
            <CardFooter>
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" leftIcon={<Save className="h-4 w-4" />} isLoading={isSubmitting}>
                Save Ice Make
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
