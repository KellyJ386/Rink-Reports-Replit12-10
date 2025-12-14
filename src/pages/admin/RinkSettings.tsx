import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Badge, Input, Select } from '../../components/ui';
import { ArrowLeft, Plus, Edit2, Trash2, Gauge, X, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { getRinks, saveRink, deleteRink } from '../../services/admin-service';
import type { Rink, MeasurementTemplate } from '../../types';

export function RinkSettings() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [rinks, setRinks] = useState<Rink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRink, setEditingRink] = useState<Partial<Rink> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRinks();
  }, []);

  async function loadRinks() {
    setIsLoading(true);
    const data = await getRinks();
    setRinks(data);
    setIsLoading(false);
  }

  const primaryUseOptions = [
    { value: 'hockey', label: 'Hockey' },
    { value: 'figure_skating', label: 'Figure Skating' },
    { value: 'recreational', label: 'Recreational' },
    { value: 'multi_use', label: 'Multi-Use' },
  ];

  const templateOptions = [
    { value: '25-point', label: '25-Point Template' },
    { value: '35-point', label: '35-Point Template' },
    { value: '47-point', label: '47-Point Template' },
  ];

  const formatPrimaryUse = (use: string) => {
    return use.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleSave = async () => {
    if (!editingRink) return;

    if (!editingRink.name) {
      showError('Missing Information', 'Please enter a rink name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveRink(editingRink);
      success('Rink Saved', editingRink.id ? 'Rink updated successfully.' : 'Rink created successfully.');
      setEditingRink(null);
      await loadRinks();
    } catch {
      showError('Save Failed', 'Failed to save rink.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rink?')) return;

    try {
      await deleteRink(id);
      success('Rink Deleted', 'Rink has been removed.');
      await loadRinks();
    } catch {
      showError('Delete Failed', 'Failed to delete rink.');
    }
  };

  const startEditing = (rink?: Rink) => {
    if (rink) {
      setEditingRink({ ...rink });
    } else {
      setEditingRink({
        name: '',
        length_ft: 200,
        width_ft: 85,
        primary_use: 'multi_use',
        target_depth_min: 25.4,
        target_depth_max: 44.45,
        measurement_template: '25-point',
        is_active: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-navy">Rink Configuration</h1>
            <p className="text-wolf-600 mt-1">Manage rinks and measurement templates</p>
          </div>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => startEditing()}>
          Add Rink
        </Button>
      </div>

      {/* Edit Modal */}
      {editingRink && (
        <Card className="border-2 border-action">
          <CardHeader
            title={editingRink.id ? 'Edit Rink' : 'Add New Rink'}
            action={
              <Button variant="ghost" size="sm" onClick={() => setEditingRink(null)}>
                <X className="h-4 w-4" />
              </Button>
            }
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Rink Name"
                value={editingRink.name || ''}
                onChange={(e) => setEditingRink({ ...editingRink, name: e.target.value })}
                placeholder="e.g., Rink A - Main Arena"
                required
              />
              <Select
                label="Primary Use"
                options={primaryUseOptions}
                value={editingRink.primary_use || 'multi_use'}
                onChange={(e) => setEditingRink({ ...editingRink, primary_use: e.target.value as Rink['primary_use'] })}
              />
              <Input
                label="Length (ft)"
                type="number"
                value={editingRink.length_ft || 200}
                onChange={(e) => setEditingRink({ ...editingRink, length_ft: parseInt(e.target.value) })}
              />
              <Input
                label="Width (ft)"
                type="number"
                value={editingRink.width_ft || 85}
                onChange={(e) => setEditingRink({ ...editingRink, width_ft: parseInt(e.target.value) })}
              />
              <Input
                label="Target Depth Min (mm)"
                type="number"
                step="0.01"
                value={editingRink.target_depth_min || 25.4}
                onChange={(e) => setEditingRink({ ...editingRink, target_depth_min: parseFloat(e.target.value) })}
              />
              <Input
                label="Target Depth Max (mm)"
                type="number"
                step="0.01"
                value={editingRink.target_depth_max || 44.45}
                onChange={(e) => setEditingRink({ ...editingRink, target_depth_max: parseFloat(e.target.value) })}
              />
              <Select
                label="Measurement Template"
                options={templateOptions}
                value={editingRink.measurement_template || '25-point'}
                onChange={(e) => setEditingRink({ ...editingRink, measurement_template: e.target.value as MeasurementTemplate })}
              />
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingRink.is_active !== false}
                  onChange={(e) => setEditingRink({ ...editingRink, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-wolf-300 text-action focus:ring-action"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-navy">
                  Active
                </label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" onClick={() => setEditingRink(null)}>
              Cancel
            </Button>
            <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} isLoading={isSubmitting}>
              Save Rink
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Rinks list */}
      {isLoading ? (
        <div className="text-center py-12 text-wolf-500">Loading rinks...</div>
      ) : rinks.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Gauge className="h-12 w-12 text-wolf-400 mx-auto mb-4" />
              <h3 className="text-lg font-display font-semibold text-navy mb-2">No rinks configured</h3>
              <p className="text-wolf-600 mb-4">Add your first rink to get started.</p>
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => startEditing()}>
                Add Rink
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rinks.map((rink) => (
            <Card key={rink.id}>
              <CardHeader
                title={rink.name}
                action={
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEditing(rink)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:bg-red-50"
                      onClick={() => handleDelete(rink.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
              <CardContent>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-wolf-600">Dimensions</dt>
                    <dd className="text-sm font-medium text-navy">
                      {rink.length_ft}' x {rink.width_ft}'
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-wolf-600">Primary Use</dt>
                    <dd className="text-sm font-medium text-navy">
                      {formatPrimaryUse(rink.primary_use)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-wolf-600">Measurement Template</dt>
                    <dd className="text-sm font-medium text-navy">{rink.measurement_template}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-wolf-600">Target Depth Range</dt>
                    <dd className="text-sm font-medium text-navy">
                      {rink.target_depth_min}mm - {rink.target_depth_max}mm
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-wolf-600">Status</dt>
                    <dd>
                      <Badge variant={rink.is_active ? 'ideal' : 'default'}>
                        {rink.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
