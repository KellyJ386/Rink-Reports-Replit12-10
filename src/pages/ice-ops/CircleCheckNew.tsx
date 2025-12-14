import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Select } from '../../components/ui';
import { ChecklistItemRow } from '../../components/ice-ops/ChecklistItemRow';
import { ArrowLeft, Save, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { saveCircleCheck } from '../../services/circle-check-service';
import { getChecklistForFuelType } from '../../data/circle-check-templates';
import type { ChecklistItemStatus, FuelType } from '../../types';

export function CircleCheckNew() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { user } = useAuth();

  const [selectedResurfacer, setSelectedResurfacer] = useState('');
  const [items, setItems] = useState<Record<string, ChecklistItemStatus>>({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Demo options
  const resurfacerOptions = [
    { value: 'z1', label: 'Zamboni #1 (Electric)', fuelType: 'electric' as FuelType },
    { value: 'z2', label: 'Zamboni #2 (Propane)', fuelType: 'propane' as FuelType },
  ];

  const selectedMachine = resurfacerOptions.find((r) => r.value === selectedResurfacer);
  const fuelType = selectedMachine?.fuelType || 'electric';
  const checklistType = fuelType === 'electric' ? 'electric' : 'gas_propane';

  // Get checklist items for selected machine type
  const checklistItems = useMemo(() => {
    return getChecklistForFuelType(fuelType);
  }, [fuelType]);

  // Calculate completion stats
  const stats = useMemo(() => {
    const total = checklistItems.length;
    const completed = Object.keys(items).length;
    const passed = Object.values(items).filter((s) => s === 'pass').length;
    const failed = Object.values(items).filter((s) => s === 'fail').length;
    const na = Object.values(items).filter((s) => s === 'na').length;
    const allComplete = completed === total;
    const overallPass = allComplete && failed === 0;

    return { total, completed, passed, failed, na, allComplete, overallPass };
  }, [checklistItems, items]);

  const handleItemChange = (itemId: string, status: ChecklistItemStatus) => {
    setItems((prev) => ({ ...prev, [itemId]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResurfacer) {
      showError('Missing Information', 'Please select a resurfacer.');
      return;
    }

    if (!stats.allComplete) {
      showError('Incomplete Checklist', 'Please complete all checklist items before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      await saveCircleCheck(
        {
          resurfacer_id: selectedResurfacer,
          checklist_type: checklistType,
          items,
          notes: notes || undefined,
        },
        user?.id || 'demo-user',
        user?.facility_id || 'demo-facility'
      );

      if (stats.overallPass) {
        success('Circle Check Complete', 'Pre-shift inspection passed successfully.');
      } else {
        success('Circle Check Logged', 'Pre-shift inspection recorded with failures. Please address issues before operating.');
      }
      navigate('/ice-ops/circle-checks');
    } catch (err) {
      showError('Save Failed', 'Failed to save circle check. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset items when resurfacer changes
  const handleResurfacerChange = (value: string) => {
    setSelectedResurfacer(value);
    setItems({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">Pre-Shift Circle Check</h1>
          <p className="text-wolf-600 mt-1">Complete inspection before operating resurfacer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Machine selection & progress */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Select Resurfacer" />
              <CardContent>
                <Select
                  label="Resurfacer"
                  options={resurfacerOptions}
                  value={selectedResurfacer}
                  onChange={(e) => handleResurfacerChange(e.target.value)}
                  placeholder="Select resurfacer"
                  required
                />
              </CardContent>
            </Card>

            {selectedResurfacer && (
              <Card>
                <CardHeader title="Progress" />
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-wolf-600">Completed</span>
                    <span className="font-bold text-navy">
                      {stats.completed} / {stats.total}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-wolf-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-action transition-all duration-300"
                      style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="p-2 bg-action-50 rounded-lg">
                      <p className="font-bold text-action">{stats.passed}</p>
                      <p className="text-action-700">Pass</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg">
                      <p className="font-bold text-red-600">{stats.failed}</p>
                      <p className="text-red-700">Fail</p>
                    </div>
                    <div className="p-2 bg-wolf-100 rounded-lg">
                      <p className="font-bold text-wolf-600">{stats.na}</p>
                      <p className="text-wolf-600">N/A</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <Card>
              <CardHeader title="Notes" description="Describe any issues or observations" />
              <CardContent>
                <textarea
                  className="w-full px-3 py-2 border border-wolf-300 rounded-lg focus:ring-2 focus:ring-action focus:border-action resize-none"
                  rows={4}
                  placeholder="Note any issues found during inspection..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right column - Checklist */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader
                title="Inspection Checklist"
                description={selectedResurfacer ? `${fuelType === 'electric' ? 'Electric' : 'Gas/Propane'} resurfacer checklist` : 'Select a resurfacer to see checklist'}
              />
              <CardContent className="flex-1">
                {!selectedResurfacer ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <ClipboardCheck className="h-12 w-12 text-wolf-300 mb-3" />
                    <p className="text-wolf-600 font-medium">Select a Resurfacer</p>
                    <p className="text-sm text-wolf-500 mt-1">
                      Choose a machine to load its inspection checklist
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {checklistItems.map((item) => (
                      <ChecklistItemRow
                        key={item.id}
                        id={item.id}
                        text={item.text}
                        status={items[item.id] || null}
                        onChange={(status) => handleItemChange(item.id, status)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
              {selectedResurfacer && (
                <CardFooter>
                  {stats.failed > 0 && (
                    <div className="flex items-center gap-2 text-red-600 text-sm mr-auto">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{stats.failed} item(s) failed - address before operating</span>
                    </div>
                  )}
                  <Button variant="secondary" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    leftIcon={<Save className="h-4 w-4" />}
                    isLoading={isSubmitting}
                    disabled={!stats.allComplete}
                    variant={stats.failed > 0 ? 'danger' : 'primary'}
                  >
                    {stats.failed > 0 ? 'Submit with Failures' : 'Submit Circle Check'}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
