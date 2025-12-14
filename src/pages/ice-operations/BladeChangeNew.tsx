import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Select, Input, TextArea } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export function BladeChangeNew() {
  const navigate = useNavigate();
  const { success } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resurfacerOptions = [
    { value: 'zamboni-1', label: 'Zamboni #1 (Electric)' },
    { value: 'olympia-2', label: 'Olympia #2 (Gas)' },
  ];

  const reasonOptions = [
    { value: 'scheduled', label: 'Scheduled Maintenance' },
    { value: 'wear', label: 'Normal Wear' },
    { value: 'damage', label: 'Damage' },
    { value: 'quality_issues', label: 'Ice Quality Issues' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    success('Blade change logged', 'Blade replacement has been recorded.');
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
          <h1 className="text-2xl font-display font-bold text-navy">Blade Change Log</h1>
          <p className="text-wolf-600 mt-1">Record conditioner blade replacement</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader title="Blade Change Details" />
          <CardContent className="space-y-4">
            <Select
              label="Resurfacer"
              options={resurfacerOptions}
              placeholder="Select resurfacer"
              required
            />

            <Input
              label="Current Hour Meter Reading"
              type="number"
              step="0.1"
              required
              helpText="Enter the current hour meter reading from the resurfacer"
            />

            <Input
              label="Hours Since Last Change"
              type="number"
              step="0.1"
              helpText="This will be auto-calculated if previous records exist"
            />

            <Select
              label="Reason for Change"
              options={reasonOptions}
              placeholder="Select reason"
              required
            />

            <TextArea
              label="Notes"
              placeholder="Describe blade condition, any issues observed, etc."
              rows={3}
            />
          </CardContent>
          <CardFooter>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" leftIcon={<Save className="h-4 w-4" />} isLoading={isSubmitting}>
              Save Blade Change
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
