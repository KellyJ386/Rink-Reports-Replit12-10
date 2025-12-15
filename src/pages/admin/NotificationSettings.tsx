import { useState } from 'react';
import {
  Card, CardHeader, CardContent, Button, Input, Toggle
} from '../../components/ui';
import {
  Bell, Mail, AlertTriangle, Droplet, Ruler, Clock,
  Save, TestTube, Plus, Trash2
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface NotificationRule {
  id: string;
  name: string;
  type: 'ice_depth_critical' | 'ice_depth_warning' | 'daily_summary' | 'weekly_report' | 'maintenance_due';
  enabled: boolean;
  recipients: string[];
  threshold?: number;
  schedule?: string;
}

// Demo notification rules
const defaultRules: NotificationRule[] = [
  {
    id: '1',
    name: 'Critical Ice Depth Alert',
    type: 'ice_depth_critical',
    enabled: true,
    recipients: ['admin@mfo-ice.com', 'manager@mfo-ice.com'],
    threshold: 25.4,
  },
  {
    id: '2',
    name: 'Ice Depth Warning',
    type: 'ice_depth_warning',
    enabled: true,
    recipients: ['admin@mfo-ice.com'],
    threshold: 28,
  },
  {
    id: '3',
    name: 'Daily Operations Summary',
    type: 'daily_summary',
    enabled: true,
    recipients: ['admin@mfo-ice.com'],
    schedule: '18:00',
  },
  {
    id: '4',
    name: 'Weekly Analytics Report',
    type: 'weekly_report',
    enabled: false,
    recipients: ['admin@mfo-ice.com'],
    schedule: 'monday',
  },
  {
    id: '5',
    name: 'Blade Change Due',
    type: 'maintenance_due',
    enabled: true,
    recipients: ['maintenance@mfo-ice.com'],
    threshold: 50, // hours
  },
];

const ruleIcons: Record<string, React.ReactNode> = {
  ice_depth_critical: <AlertTriangle className="h-5 w-5 text-danger" />,
  ice_depth_warning: <Ruler className="h-5 w-5 text-warning" />,
  daily_summary: <Clock className="h-5 w-5 text-blue-500" />,
  weekly_report: <Mail className="h-5 w-5 text-action" />,
  maintenance_due: <Droplet className="h-5 w-5 text-amber-500" />,
};

const ruleDescriptions: Record<string, string> = {
  ice_depth_critical: 'Alert when ice depth falls below critical threshold',
  ice_depth_warning: 'Alert when ice depth approaches warning zone',
  daily_summary: 'Daily summary of all ice operations',
  weekly_report: 'Weekly analytics and trend report',
  maintenance_due: 'Alert when blade change hours threshold is reached',
};

export function NotificationSettings() {
  const { success, error } = useToast();
  const [rules, setRules] = useState<NotificationRule[]>(defaultRules);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [newRecipient, setNewRecipient] = useState('');

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const addRecipient = (ruleId: string) => {
    if (!newRecipient || !newRecipient.includes('@')) {
      error('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setRules(rules.map(rule =>
      rule.id === ruleId
        ? { ...rule, recipients: [...rule.recipients, newRecipient] }
        : rule
    ));
    setNewRecipient('');
  };

  const removeRecipient = (ruleId: string, email: string) => {
    setRules(rules.map(rule =>
      rule.id === ruleId
        ? { ...rule, recipients: rule.recipients.filter(r => r !== email) }
        : rule
    ));
  };

  const updateThreshold = (ruleId: string, value: number) => {
    setRules(rules.map(rule =>
      rule.id === ruleId ? { ...rule, threshold: value } : rule
    ));
  };

  const handleSave = () => {
    // In production, save to Supabase
    success('Settings Saved', 'Notification settings have been updated');
  };

  const handleTestEmail = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule && rule.recipients.length > 0) {
      success('Test Email Sent', `Test notification sent to ${rule.recipients[0]}`);
    } else {
      error('No Recipients', 'Add at least one recipient to test');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">Notification Settings</h1>
          <p className="text-wolf-600 mt-1">Configure email alerts and reports</p>
        </div>
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader
          title="Email Configuration"
          description="Configure your email notification preferences"
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="From Name"
              defaultValue="MFO Ice Management"
              placeholder="Sender name"
            />
            <Input
              label="Reply-To Email"
              type="email"
              defaultValue="noreply@mfo-ice.com"
              placeholder="Reply-to address"
            />
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Email notifications require Supabase Edge Functions or a third-party email service (SendGrid, Resend, etc.) to be configured in production.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Rules */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-semibold text-navy">Notification Rules</h2>

        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-wolf-100 rounded-lg">
                    {ruleIcons[rule.type]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-navy">{rule.name}</h3>
                      <Toggle
                        checked={rule.enabled}
                        onChange={() => toggleRule(rule.id)}
                      />
                    </div>
                    <p className="text-sm text-wolf-600 mt-1">
                      {ruleDescriptions[rule.type]}
                    </p>

                    {/* Threshold setting for applicable rules */}
                    {(rule.type === 'ice_depth_critical' || rule.type === 'ice_depth_warning') && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-wolf-600">Threshold:</span>
                        <input
                          type="number"
                          value={rule.threshold}
                          onChange={(e) => updateThreshold(rule.id, parseFloat(e.target.value))}
                          className="w-20 px-2 py-1 text-sm border border-wolf-300 rounded"
                          step="0.1"
                        />
                        <span className="text-sm text-wolf-500">mm</span>
                      </div>
                    )}

                    {rule.type === 'maintenance_due' && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-wolf-600">Alert at:</span>
                        <input
                          type="number"
                          value={rule.threshold}
                          onChange={(e) => updateThreshold(rule.id, parseFloat(e.target.value))}
                          className="w-20 px-2 py-1 text-sm border border-wolf-300 rounded"
                        />
                        <span className="text-sm text-wolf-500">hours since last blade change</span>
                      </div>
                    )}

                    {/* Recipients */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-wolf-700 mb-2">Recipients:</p>
                      <div className="flex flex-wrap gap-2">
                        {rule.recipients.map((email) => (
                          <span
                            key={email}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-wolf-100 rounded text-sm"
                          >
                            {email}
                            <button
                              onClick={() => removeRecipient(rule.id, email)}
                              className="text-wolf-400 hover:text-danger"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        {editingRule === rule.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="email"
                              value={newRecipient}
                              onChange={(e) => setNewRecipient(e.target.value)}
                              placeholder="email@example.com"
                              className="w-40 px-2 py-1 text-sm border border-wolf-300 rounded"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  addRecipient(rule.id);
                                  setEditingRule(null);
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                addRecipient(rule.id);
                                setEditingRule(null);
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingRule(rule.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-sm text-action hover:bg-action-50 rounded"
                          >
                            <Plus className="h-3 w-3" />
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<TestTube className="h-4 w-4" />}
                  onClick={() => handleTestEmail(rule.id)}
                >
                  Test
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Supabase Integration Note */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Bell className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-navy">Production Email Setup</h3>
              <p className="text-sm text-wolf-600 mt-1">
                To enable email notifications in production, you'll need to:
              </p>
              <ol className="text-sm text-wolf-600 mt-2 list-decimal list-inside space-y-1">
                <li>Set up a Supabase Edge Function for sending emails</li>
                <li>Configure an email provider (Resend, SendGrid, or Postmark)</li>
                <li>Add database triggers for alert conditions</li>
                <li>Store notification preferences in the database</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
