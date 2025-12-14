import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Badge, Input, Select } from '../../components/ui';
import { ArrowLeft, Plus, Edit2, Trash2, Snowflake, X, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { getResurfacers, saveResurfacer, deleteResurfacer, getRinks } from '../../services/admin-service';
import type { Resurfacer, Rink, FuelType } from '../../types';

export function ResurfacerSettings() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [resurfacers, setResurfacers] = useState<Resurfacer[]>([]);
  const [rinks, setRinks] = useState<Rink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingResurfacer, setEditingResurfacer] = useState<Partial<Resurfacer> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    const [resurfacerData, rinkData] = await Promise.all([
      getResurfacers(),
      getRinks(),
    ]);
    setResurfacers(resurfacerData);
    setRinks(rinkData);
    setIsLoading(false);
  }

  const fuelTypeOptions = [
    { value: 'electric', label: 'Electric' },
    { value: 'gas', label: 'Gasoline' },
    { value: 'propane', label: 'Propane' },
  ];

  const getFuelTypeBadgeVariant = (fuelType: string) => {
    switch (fuelType) {
      case 'electric':
        return 'ideal';
      case 'gas':
        return 'warning';
      case 'propane':
        return 'info';
      default:
        return 'default';
    }
  };

  const getRinkNames = (rinkIds: string[]) => {
    return rinkIds
      .map((id) => rinks.find((r) => r.id === id)?.name || id)
      .join(', ') || 'Unassigned';
  };

  const handleSave = async () => {
    if (!editingResurfacer) return;

    if (!editingResurfacer.name) {
      showError('Missing Information', 'Please enter a resurfacer name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveResurfacer(editingResurfacer);
      success('Resurfacer Saved', editingResurfacer.id ? 'Resurfacer updated.' : 'Resurfacer created.');
      setEditingResurfacer(null);
      await loadData();
    } catch {
      showError('Save Failed', 'Failed to save resurfacer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resurfacer?')) return;

    try {
      await deleteResurfacer(id);
      success('Resurfacer Deleted', 'Resurfacer has been removed.');
      await loadData();
    } catch {
      showError('Delete Failed', 'Failed to delete resurfacer.');
    }
  };

  const startEditing = (resurfacer?: Resurfacer) => {
    if (resurfacer) {
      setEditingResurfacer({ ...resurfacer });
    } else {
      setEditingResurfacer({
        name: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        fuel_type: 'electric',
        hour_meter_reading: 0,
        assigned_rink_ids: [],
        is_active: true,
      });
    }
  };

  const toggleRinkAssignment = (rinkId: string) => {
    if (!editingResurfacer) return;
    const current = editingResurfacer.assigned_rink_ids || [];
    const updated = current.includes(rinkId)
      ? current.filter((id) => id !== rinkId)
      : [...current, rinkId];
    setEditingResurfacer({ ...editingResurfacer, assigned_rink_ids: updated });
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
            <h1 className="text-2xl font-display font-bold text-navy">Resurfacer Management</h1>
            <p className="text-wolf-600 mt-1">Manage ice resurfacer inventory</p>
          </div>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => startEditing()}>
          Add Resurfacer
        </Button>
      </div>

      {/* Edit Modal */}
      {editingResurfacer && (
        <Card className="border-2 border-action">
          <CardHeader
            title={editingResurfacer.id ? 'Edit Resurfacer' : 'Add New Resurfacer'}
            action={
              <Button variant="ghost" size="sm" onClick={() => setEditingResurfacer(null)}>
                <X className="h-4 w-4" />
              </Button>
            }
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                value={editingResurfacer.name || ''}
                onChange={(e) => setEditingResurfacer({ ...editingResurfacer, name: e.target.value })}
                placeholder="e.g., Zamboni #1"
                required
              />
              <Select
                label="Fuel Type"
                options={fuelTypeOptions}
                value={editingResurfacer.fuel_type || 'electric'}
                onChange={(e) => setEditingResurfacer({ ...editingResurfacer, fuel_type: e.target.value as FuelType })}
              />
              <Input
                label="Make"
                value={editingResurfacer.make || ''}
                onChange={(e) => setEditingResurfacer({ ...editingResurfacer, make: e.target.value })}
                placeholder="e.g., Zamboni"
              />
              <Input
                label="Model"
                value={editingResurfacer.model || ''}
                onChange={(e) => setEditingResurfacer({ ...editingResurfacer, model: e.target.value })}
                placeholder="e.g., 552"
              />
              <Input
                label="Year"
                type="number"
                value={editingResurfacer.year || new Date().getFullYear()}
                onChange={(e) => setEditingResurfacer({ ...editingResurfacer, year: parseInt(e.target.value) })}
              />
              <Input
                label="Hour Meter Reading"
                type="number"
                step="0.1"
                value={editingResurfacer.hour_meter_reading || 0}
                onChange={(e) => setEditingResurfacer({ ...editingResurfacer, hour_meter_reading: parseFloat(e.target.value) })}
              />
              <Input
                label="Serial Number"
                value={editingResurfacer.serial_number || ''}
                onChange={(e) => setEditingResurfacer({ ...editingResurfacer, serial_number: e.target.value })}
                placeholder="Optional"
              />
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="resurfacer_active"
                  checked={editingResurfacer.is_active !== false}
                  onChange={(e) => setEditingResurfacer({ ...editingResurfacer, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-wolf-300 text-action focus:ring-action"
                />
                <label htmlFor="resurfacer_active" className="text-sm font-medium text-navy">
                  Active
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-2">Assigned Rinks</label>
              <div className="flex flex-wrap gap-2">
                {rinks.map((rink) => (
                  <button
                    key={rink.id}
                    type="button"
                    onClick={() => toggleRinkAssignment(rink.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      (editingResurfacer.assigned_rink_ids || []).includes(rink.id)
                        ? 'bg-action text-white'
                        : 'bg-wolf-100 text-wolf-600 hover:bg-wolf-200'
                    }`}
                  >
                    {rink.name}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" onClick={() => setEditingResurfacer(null)}>
              Cancel
            </Button>
            <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} isLoading={isSubmitting}>
              Save Resurfacer
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Resurfacers table */}
      {isLoading ? (
        <div className="text-center py-12 text-wolf-500">Loading resurfacers...</div>
      ) : resurfacers.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Snowflake className="h-12 w-12 text-wolf-400 mx-auto mb-4" />
              <h3 className="text-lg font-display font-semibold text-navy mb-2">No resurfacers configured</h3>
              <p className="text-wolf-600 mb-4">Add your first resurfacer to get started.</p>
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => startEditing()}>
                Add Resurfacer
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Resurfacers"
            description={`${resurfacers.filter((r) => r.is_active).length} active units`}
          />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-wolf-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Make/Model</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Year</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Fuel Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Hours</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Assigned</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-navy">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resurfacers.map((resurfacer) => (
                    <tr key={resurfacer.id} className="border-b border-wolf-100 hover:bg-wolf-50">
                      <td className="py-3 px-4 text-sm font-medium text-navy">{resurfacer.name}</td>
                      <td className="py-3 px-4 text-sm text-wolf-600">
                        {resurfacer.make} {resurfacer.model}
                      </td>
                      <td className="py-3 px-4 text-sm text-wolf-600">{resurfacer.year}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getFuelTypeBadgeVariant(resurfacer.fuel_type)}>
                          {resurfacer.fuel_type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-wolf-600">
                        {resurfacer.hour_meter_reading.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-sm text-wolf-600">
                        {getRinkNames(resurfacer.assigned_rink_ids)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={resurfacer.is_active ? 'ideal' : 'default'}>
                          {resurfacer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => startEditing(resurfacer)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-red-50"
                            onClick={() => handleDelete(resurfacer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
