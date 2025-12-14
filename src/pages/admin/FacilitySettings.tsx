import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Input, Select } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export function FacilitySettings() {
  const navigate = useNavigate();
  const { success } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  ];

  const countryOptions = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    success('Settings saved', 'Facility settings have been updated.');
    setIsSubmitting(false);
  };

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
                defaultValue="Tennity Ice Skating Pavilion"
                required
              />
              <Input label="Address" defaultValue="1501 Jamesville Avenue" required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" defaultValue="Syracuse" required />
                <Input label="State/Province" defaultValue="NY" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="ZIP/Postal Code" defaultValue="13244" required />
                <Select
                  label="Country"
                  options={countryOptions}
                  defaultValue="US"
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
                defaultValue="rink@syr.edu"
                required
              />
              <Input
                label="Contact Phone"
                type="tel"
                defaultValue="(315) 443-4498"
              />
              <Select
                label="Timezone"
                options={timezoneOptions}
                defaultValue="America/New_York"
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
