import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Select } from '../../components/ui';
import { ArrowLeft, Save, Check, X, Minus } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const electricChecklist = [
  'Battery charge level adequate',
  'Battery cables and connections - no corrosion',
  'Conditioner blade condition checked',
  'Blade runner inspected',
  'Towel and squeegee condition verified',
  'Water system functional',
  'Hydraulic system checked',
  'Tires - proper inflation and condition',
  'Brakes tested',
  'Steering responsive',
  'Horn and lights operational',
  'Safety guards in place',
  'Auger systems checked',
  'Board brush condition verified',
  'Flood pipe distribution checked',
  'Body and safety labels intact',
  'Steps clear and clean',
  'Fire extinguisher present',
  'Path to ice surface clear',
  'All gauges operational',
];

type CheckStatus = 'pass' | 'fail' | 'na';

export function CircleCheckNew() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checks, setChecks] = useState<Record<number, CheckStatus>>({});

  const resurfacerOptions = [
    { value: 'zamboni-1', label: 'Zamboni #1 (Electric)' },
    { value: 'olympia-2', label: 'Olympia #2 (Gas)' },
  ];

  const setCheckStatus = (index: number, status: CheckStatus) => {
    setChecks((prev) => ({ ...prev, [index]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all items have been checked
    const completedCount = Object.keys(checks).length;
    if (completedCount < electricChecklist.length) {
      error('Incomplete checklist', 'Please complete all checklist items before submitting.');
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const hasFailed = Object.values(checks).some((status) => status === 'fail');
    if (hasFailed) {
      success('Circle check logged', 'Check failed. Issues have been flagged for review.');
    } else {
      success('Circle check passed', 'Pre-operation inspection completed successfully.');
    }

    navigate('/ice-operations');
  };

  const completedCount = Object.keys(checks).length;
  const passedCount = Object.values(checks).filter((s) => s === 'pass').length;
  const failedCount = Object.values(checks).filter((s) => s === 'fail').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">Circle Check</h1>
          <p className="text-wolf-600 mt-1">Pre-operation safety inspection</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Resurfacer" />
              <CardContent>
                <Select
                  options={resurfacerOptions}
                  placeholder="Select resurfacer"
                  required
                />
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader title="Progress" />
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-wolf-600">Completed</span>
                    <span className="font-medium text-navy">
                      {completedCount}/{electricChecklist.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-wolf-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-action rounded-full transition-all"
                      style={{ width: `${(completedCount / electricChecklist.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1 text-action">
                      <Check className="h-4 w-4" /> {passedCount} passed
                    </span>
                    <span className="flex items-center gap-1 text-danger">
                      <X className="h-4 w-4" /> {failedCount} failed
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checklist */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Electric Resurfacer Checklist"
              description="Mark each item as Pass, Fail, or N/A"
            />
            <CardContent>
              <div className="space-y-3">
                {electricChecklist.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-wolf-50 rounded-lg"
                  >
                    <span className="text-sm text-navy flex-1 pr-4">
                      {index + 1}. {item}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCheckStatus(index, 'pass')}
                        className={`p-2 rounded-lg transition-colors ${
                          checks[index] === 'pass'
                            ? 'bg-action text-white'
                            : 'bg-wolf-200 text-wolf-600 hover:bg-action-100'
                        }`}
                        aria-label="Pass"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckStatus(index, 'fail')}
                        className={`p-2 rounded-lg transition-colors ${
                          checks[index] === 'fail'
                            ? 'bg-danger text-white'
                            : 'bg-wolf-200 text-wolf-600 hover:bg-red-100'
                        }`}
                        aria-label="Fail"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckStatus(index, 'na')}
                        className={`p-2 rounded-lg transition-colors ${
                          checks[index] === 'na'
                            ? 'bg-wolf-500 text-white'
                            : 'bg-wolf-200 text-wolf-600 hover:bg-wolf-300'
                        }`}
                        aria-label="Not Applicable"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
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
                Submit Circle Check
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
