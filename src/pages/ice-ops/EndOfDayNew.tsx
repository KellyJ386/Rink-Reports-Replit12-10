import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Select } from '../../components/ui';
import { ArrowLeft, Save, Moon, CheckSquare, Square, Droplet } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { saveEndOfDayReport } from '../../services/end-of-day-service';
import { getTodayIceMakesCount } from '../../services/ice-make-service';
import { END_OF_DAY_CHECKLIST, CATEGORY_LABELS, getChecklistByCategory } from '../../data/end-of-day-checklist';
import { cn } from '../../lib/utils';

export function EndOfDayNew() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { user } = useAuth();

  const [selectedRink, setSelectedRink] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayIceMakes, setTodayIceMakes] = useState(0);

  const rinkOptions = [
    { value: 'rink-a', label: 'Rink A - Main Arena' },
    { value: 'rink-b', label: 'Rink B - Practice Rink' },
  ];

  const checklistByCategory = getChecklistByCategory();

  // Load today's ice makes count
  useEffect(() => {
    if (selectedRink) {
      getTodayIceMakesCount(selectedRink).then(setTodayIceMakes);
    }
  }, [selectedRink]);

  const toggleItem = (itemId: string) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const checkAll = () => {
    const all: Record<string, boolean> = {};
    END_OF_DAY_CHECKLIST.forEach((item) => {
      all[item.id] = true;
    });
    setCheckedItems(all);
  };

  const uncheckAll = () => {
    setCheckedItems({});
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = END_OF_DAY_CHECKLIST.length;
  const allComplete = completedCount === totalCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRink) {
      showError('Missing Information', 'Please select a rink.');
      return;
    }

    if (!allComplete) {
      showError('Incomplete Checklist', 'Please complete all checklist items before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      await saveEndOfDayReport(
        {
          rink_id: selectedRink,
          checklist_items: checkedItems,
          notes: notes || undefined,
        },
        user?.id || 'demo-user',
        user?.facility_id || 'demo-facility'
      );

      success('End of Day Report Submitted', 'Report has been saved successfully.');
      navigate('/ice-ops/end-of-day');
    } catch (err) {
      showError('Save Failed', 'Failed to save report. Please try again.');
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
          <h1 className="text-2xl font-display font-bold text-navy">End of Day Report</h1>
          <p className="text-wolf-600 mt-1">Complete shift summary and handoff checklist</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Rink selection & stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Rink Selection" />
              <CardContent>
                <Select
                  label="Rink"
                  options={rinkOptions}
                  value={selectedRink}
                  onChange={(e) => setSelectedRink(e.target.value)}
                  placeholder="Select a rink"
                  required
                />
              </CardContent>
            </Card>

            {selectedRink && (
              <Card className="bg-action-50 border-action-200">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-action-100 rounded-lg">
                      <Droplet className="h-6 w-6 text-action" />
                    </div>
                    <div>
                      <p className="text-sm text-action-700">Today's Ice Makes</p>
                      <p className="text-3xl font-bold text-action-800">{todayIceMakes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader title="Progress" />
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-wolf-600">Completed</span>
                  <span className="font-bold text-navy">
                    {completedCount} / {totalCount}
                  </span>
                </div>
                <div className="w-full h-2 bg-wolf-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      allComplete ? 'bg-action' : 'bg-navy'
                    )}
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={checkAll}>
                    Check All
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={uncheckAll}>
                    Uncheck All
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Shift Notes" description="Handoff notes for next shift" />
              <CardContent>
                <textarea
                  className="w-full px-3 py-2 border border-wolf-300 rounded-lg focus:ring-2 focus:ring-action focus:border-action resize-none"
                  rows={4}
                  placeholder="Any issues, concerns, or notes for the next shift..."
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
                title="End of Day Checklist"
                description="Complete all items before submitting"
                action={
                  <div className="flex items-center gap-2">
                    <Moon className="h-5 w-5 text-navy" />
                  </div>
                }
              />
              <CardContent className="flex-1 space-y-6">
                {Object.entries(checklistByCategory).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-navy uppercase tracking-wide mb-3">
                      {CATEGORY_LABELS[category]}
                    </h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          className={cn(
                            'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                            checkedItems[item.id]
                              ? 'bg-action-50 border-action-200'
                              : 'bg-white border-wolf-200 hover:bg-wolf-50'
                          )}
                        >
                          {checkedItems[item.id] ? (
                            <CheckSquare className="h-5 w-5 text-action flex-shrink-0" />
                          ) : (
                            <Square className="h-5 w-5 text-wolf-400 flex-shrink-0" />
                          )}
                          <span
                            className={cn(
                              'text-sm',
                              checkedItems[item.id] ? 'text-action-800' : 'text-navy'
                            )}
                          >
                            {item.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  leftIcon={<Save className="h-4 w-4" />}
                  isLoading={isSubmitting}
                  disabled={!allComplete || !selectedRink}
                >
                  Submit Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
