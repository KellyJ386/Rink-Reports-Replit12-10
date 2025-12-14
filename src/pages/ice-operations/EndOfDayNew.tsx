import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Select, Input, TextArea } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const endOfDayChecklist = [
  'Water tanks drained',
  'Snow disposal completed',
  'Resurfacer parked on level surface',
  'Parking brake engaged',
  'Key removed and secured',
  'Blade condition noted',
  'Fuel/charging status verified',
  'Resurfacer room cleaned',
  'Equipment properly stored',
  'Doors/gates secured',
];

export function EndOfDayNew() {
  const navigate = useNavigate();
  const { success } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checks, setChecks] = useState<Record<number, boolean>>({});

  const rinkOptions = [
    { value: 'rink-a', label: 'Rink A - Main Arena' },
    { value: 'rink-b', label: 'Rink B - Practice Rink' },
  ];

  const toggleCheck = (index: number) => {
    setChecks((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    success('End of day report submitted', 'Daily summary has been recorded.');
    navigate('/ice-operations');
  };

  const completedCount = Object.values(checks).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">End of Day Report</h1>
          <p className="text-wolf-600 mt-1">Daily summary and closing checklist</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary */}
          <Card>
            <CardHeader title="Daily Summary" />
            <CardContent className="space-y-4">
              <Select label="Rink" options={rinkOptions} placeholder="Select a rink" required />

              <Input
                label="Total Ice Makes Today"
                type="number"
                min="0"
                required
                helpText="Enter the total number of resurfacing runs completed today"
              />

              <TextArea
                label="Notes & Observations"
                placeholder="Any equipment issues, ice conditions, or items for the next shift..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader
              title="Closing Checklist"
              description={`${completedCount}/${endOfDayChecklist.length} items completed`}
            />
            <CardContent>
              <div className="space-y-3">
                {endOfDayChecklist.map((item, index) => (
                  <label
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      checks[index] ? 'bg-action-50 border border-action' : 'bg-wolf-50 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checks[index] || false}
                      onChange={() => toggleCheck(index)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        checks[index]
                          ? 'bg-action border-action'
                          : 'bg-white border-wolf-300'
                      }`}
                    >
                      {checks[index] && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-navy">{item}</span>
                  </label>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" leftIcon={<Save className="h-4 w-4" />} isLoading={isSubmitting}>
                Submit Report
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
