import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Input, Select } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { getFacility, saveFacility } from '../../services/admin-service';
import type { Facility } from '../../types';

export function FacilitySettings() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [facility, setFacility] = useState<Facility | null>(null);

  useEffect(() => {
    async function loadFacility() {
      const data = await getFacility();
      setFacility(data);
      setIsLoading(false);
    }
    loadFacility();
  }, []);

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Toronto', label: 'Toronto (ET)' },
    { value: 'America/Vancouver', label: 'Vancouver (PT)' },
  ];

  const countryOptions = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facility) return;

    setIsSubmitting(true);
    try {
      await saveFacility(facility);
      success('Settings saved', 'Facility settings have been updated.');
    } catch {
      showError('Save Failed', 'Failed to save facility settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof Facility, value: string) => {
    if (!facility) return;
    setFacility({ ...facility, [field]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-wolf-500">Loading settings...</p>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-wolf-500">Failed to load facility settings.</p>
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
          <h1 className="text-2xl font-display font-bold text-navy">Facility Settings</h1>
          <p className="text-wolf-600 mt-1">Configure your facility information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic info */}
          <Card>
            <CardHeader title="Basic Information" />
            <CardContent className="space-y-4">
              <Input
                label="Facility Name"
                value={facility.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
              <Input
                label="Address"
                value={facility.address}
                onChange={(e) => updateField('address', e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={facility.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  required
                />
                <Input
                  label="State/Province"
                  value={facility.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ZIP/Postal Code"
                  value={facility.zip_code}
                  onChange={(e) => updateField('zip_code', e.target.value)}
                  required
                />
                <Select
                  label="Country"
                  options={countryOptions}
                  value={facility.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact & Settings */}
          <Card>
            <CardHeader title="Contact & Settings" />
            <CardContent className="space-y-4">
              <Input
                label="Contact Email"
                type="email"
                value={facility.contact_email}
                onChange={(e) => updateField('contact_email', e.target.value)}
                required
              />
              <Input
                label="Contact Phone"
                type="tel"
                value={facility.contact_phone}
                onChange={(e) => updateField('contact_phone', e.target.value)}
              />
              <Select
                label="Timezone"
                options={timezoneOptions}
                value={facility.timezone}
                onChange={(e) => updateField('timezone', e.target.value)}
                required
              />
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
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
