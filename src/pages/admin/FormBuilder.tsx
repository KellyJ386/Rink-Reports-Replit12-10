import { useState } from 'react';
import {
  Card, CardHeader, CardContent, Button, Input, Select, Toggle, Modal, ModalFooter
} from '../../components/ui';
import {
  Plus, Trash2, GripVertical, Save, Eye, Copy,
  Type, Hash, Calendar, List, CheckSquare, ToggleLeft,
  FileText, Image, PenLine, ArrowUp, ArrowDown
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import type { FormField, FormFieldType, CustomForm } from '../../types';
import { generateUUID } from '../../lib/utils';

const FIELD_TYPES: { type: FormFieldType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Text Input', icon: <Type className="h-4 w-4" /> },
  { type: 'textarea', label: 'Text Area', icon: <FileText className="h-4 w-4" /> },
  { type: 'number', label: 'Number', icon: <Hash className="h-4 w-4" /> },
  { type: 'date', label: 'Date', icon: <Calendar className="h-4 w-4" /> },
  { type: 'time', label: 'Time', icon: <Calendar className="h-4 w-4" /> },
  { type: 'dropdown', label: 'Dropdown', icon: <List className="h-4 w-4" /> },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="h-4 w-4" /> },
  { type: 'radio', label: 'Radio Buttons', icon: <CheckSquare className="h-4 w-4" /> },
  { type: 'toggle', label: 'Toggle Switch', icon: <ToggleLeft className="h-4 w-4" /> },
  { type: 'file', label: 'File Upload', icon: <Image className="h-4 w-4" /> },
  { type: 'signature', label: 'Signature', icon: <PenLine className="h-4 w-4" /> },
  { type: 'section_header', label: 'Section Header', icon: <Type className="h-4 w-4" /> },
  { type: 'instruction_text', label: 'Instructions', icon: <FileText className="h-4 w-4" /> },
];

const MODULE_OPTIONS = [
  { value: 'ice_maintenance', label: 'Ice Maintenance' },
  { value: 'refrigeration', label: 'Refrigeration' },
  { value: 'daily_reports', label: 'Daily Reports' },
  { value: 'air_quality', label: 'Air Quality' },
  { value: 'incident_reports', label: 'Incident Reports' },
  { value: 'communications', label: 'Communications' },
];

// Demo forms
const DEMO_FORMS: CustomForm[] = [
  {
    id: '1',
    facility_id: 'demo',
    name: 'Pre-Event Ice Check',
    module: 'ice_maintenance',
    is_active: true,
    created_by: 'demo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    fields: [
      { id: 'f1', type: 'section_header', label: 'Ice Conditions', order: 1 },
      { id: 'f2', type: 'dropdown', label: 'Ice Quality Rating', options: [
        { value: 'excellent', label: 'Excellent' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' },
        { value: 'poor', label: 'Poor' },
      ], validation: { required: true }, order: 2 },
      { id: 'f3', type: 'toggle', label: 'Lines Visible', order: 3 },
      { id: 'f4', type: 'toggle', label: 'Logos Visible', order: 4 },
      { id: 'f5', type: 'textarea', label: 'Notes', placeholder: 'Any issues or observations...', order: 5 },
      { id: 'f6', type: 'signature', label: 'Technician Signature', validation: { required: true }, order: 6 },
    ],
  },
];

export function FormBuilder() {
  const { success, error } = useToast();
  const [forms, setForms] = useState<CustomForm[]>(DEMO_FORMS);
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showFieldPicker, setShowFieldPicker] = useState(false);

  // Form editing state
  const [formName, setFormName] = useState('');
  const [formModule, setFormModule] = useState<string>('ice_maintenance');
  const [fields, setFields] = useState<FormField[]>([]);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const startNewForm = () => {
    setFormName('');
    setFormModule('ice_maintenance');
    setFields([]);
    setSelectedForm(null);
    setIsEditing(true);
  };

  const editForm = (form: CustomForm) => {
    setFormName(form.name);
    setFormModule(form.module);
    setFields(form.fields);
    setSelectedForm(form);
    setIsEditing(true);
  };

  const addField = (type: FormFieldType) => {
    const newField: FormField = {
      id: generateUUID(),
      type,
      label: FIELD_TYPES.find(f => f.type === type)?.label || 'New Field',
      order: fields.length + 1,
      options: type === 'dropdown' || type === 'radio' ? [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ] : undefined,
    };
    setFields([...fields, newField]);
    setShowFieldPicker(false);
    setEditingField(newField);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId).map((f, i) => ({ ...f, order: i + 1 })));
    if (editingField?.id === fieldId) {
      setEditingField(null);
    }
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(f => f.id === fieldId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) return;

    const newFields = [...fields];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[swapIndex]] = [newFields[swapIndex], newFields[index]];
    setFields(newFields.map((f, i) => ({ ...f, order: i + 1 })));
  };

  const saveForm = () => {
    if (!formName.trim()) {
      error('Missing Name', 'Please enter a form name');
      return;
    }

    if (fields.length === 0) {
      error('No Fields', 'Add at least one field to the form');
      return;
    }

    const newForm: CustomForm = {
      id: selectedForm?.id || generateUUID(),
      facility_id: 'demo',
      name: formName,
      module: formModule as CustomForm['module'],
      fields,
      is_active: true,
      created_by: 'demo',
      created_at: selectedForm?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (selectedForm) {
      setForms(forms.map(f => f.id === selectedForm.id ? newForm : f));
    } else {
      setForms([...forms, newForm]);
    }

    success('Form Saved', `"${formName}" has been saved successfully`);
    setIsEditing(false);
    setSelectedForm(null);
  };

  const duplicateForm = (form: CustomForm) => {
    const newForm: CustomForm = {
      ...form,
      id: generateUUID(),
      name: `${form.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setForms([...forms, newForm]);
    success('Form Duplicated', `Created copy of "${form.name}"`);
  };

  const deleteForm = (formId: string) => {
    setForms(forms.filter(f => f.id !== formId));
    success('Form Deleted', 'The form has been removed');
  };

  // Form Builder UI
  if (isEditing) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-navy">
              {selectedForm ? 'Edit Form' : 'Create New Form'}
            </h1>
            <p className="text-wolf-600 mt-1">Design your custom form</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Eye className="h-4 w-4" />}
              onClick={() => setShowPreview(true)}
            >
              Preview
            </Button>
            <Button leftIcon={<Save className="h-4 w-4" />} onClick={saveForm}>
              Save Form
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Settings */}
          <Card>
            <CardHeader title="Form Settings" />
            <CardContent className="space-y-4">
              <Input
                label="Form Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter form name"
              />
              <Select
                label="Module"
                value={formModule}
                onChange={(e) => setFormModule(e.target.value)}
                options={MODULE_OPTIONS}
              />
            </CardContent>
          </Card>

          {/* Fields List */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Form Fields"
              action={
                <Button
                  size="sm"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setShowFieldPicker(true)}
                >
                  Add Field
                </Button>
              }
            />
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-wolf-300 mx-auto mb-3" />
                  <p className="text-wolf-600 font-medium">No fields yet</p>
                  <p className="text-sm text-wolf-500 mt-1">
                    Click "Add Field" to start building your form
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        editingField?.id === field.id
                          ? 'border-action bg-action-50'
                          : 'border-wolf-200 hover:border-wolf-300'
                      }`}
                      onClick={() => setEditingField(field)}
                    >
                      <GripVertical className="h-4 w-4 text-wolf-400 cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {FIELD_TYPES.find(f => f.type === field.type)?.icon}
                          <span className="font-medium text-navy truncate">{field.label}</span>
                        </div>
                        <p className="text-xs text-wolf-500 capitalize">
                          {field.type.replace('_', ' ')}
                          {field.validation?.required && ' • Required'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveField(field.id, 'up'); }}
                          disabled={index === 0}
                          className="p-1 text-wolf-400 hover:text-navy disabled:opacity-30"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveField(field.id, 'down'); }}
                          disabled={index === fields.length - 1}
                          className="p-1 text-wolf-400 hover:text-navy disabled:opacity-30"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                          className="p-1 text-wolf-400 hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Field Editor Panel */}
        {editingField && (
          <Card>
            <CardHeader
              title={`Edit Field: ${editingField.label}`}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingField(null)}
                >
                  Close
                </Button>
              }
            />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Label"
                  value={editingField.label}
                  onChange={(e) => updateField(editingField.id, { label: e.target.value })}
                />
                <Input
                  label="Placeholder"
                  value={editingField.placeholder || ''}
                  onChange={(e) => updateField(editingField.id, { placeholder: e.target.value })}
                />
                <Input
                  label="Help Text"
                  value={editingField.help_text || ''}
                  onChange={(e) => updateField(editingField.id, { help_text: e.target.value })}
                />
                <div className="flex items-center gap-4">
                  <Toggle
                    label="Required"
                    checked={editingField.validation?.required || false}
                    onChange={(e) => updateField(editingField.id, {
                      validation: { ...editingField.validation, required: e.target.checked }
                    })}
                  />
                </div>
              </div>

              {/* Options for dropdown/radio */}
              {(editingField.type === 'dropdown' || editingField.type === 'radio') && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-navy mb-2">Options</p>
                  <div className="space-y-2">
                    {editingField.options?.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          value={opt.label}
                          onChange={(e) => {
                            const newOptions = [...(editingField.options || [])];
                            newOptions[i] = { ...opt, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') };
                            updateField(editingField.id, { options: newOptions });
                          }}
                          placeholder={`Option ${i + 1}`}
                        />
                        <button
                          onClick={() => {
                            const newOptions = editingField.options?.filter((_, idx) => idx !== i);
                            updateField(editingField.id, { options: newOptions });
                          }}
                          className="p-2 text-wolf-400 hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Plus className="h-4 w-4" />}
                      onClick={() => {
                        const newOptions = [...(editingField.options || []), { value: '', label: '' }];
                        updateField(editingField.id, { options: newOptions });
                      }}
                    >
                      Add Option
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Field Type Picker Modal */}
        <Modal
          isOpen={showFieldPicker}
          onClose={() => setShowFieldPicker(false)}
          title="Add Field"
          size="md"
        >
          <div className="grid grid-cols-2 gap-2">
            {FIELD_TYPES.map((fieldType) => (
              <button
                key={fieldType.type}
                onClick={() => addField(fieldType.type)}
                className="flex items-center gap-3 p-3 rounded-lg border border-wolf-200 hover:border-action hover:bg-action-50 transition-colors text-left"
              >
                <div className="p-2 bg-wolf-100 rounded-lg">
                  {fieldType.icon}
                </div>
                <span className="font-medium text-navy">{fieldType.label}</span>
              </button>
            ))}
          </div>
        </Modal>

        {/* Preview Modal */}
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title={formName || 'Form Preview'}
          size="lg"
        >
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id}>
                {field.type === 'section_header' ? (
                  <h3 className="text-lg font-semibold text-navy border-b border-wolf-200 pb-2 mt-4">
                    {field.label}
                  </h3>
                ) : field.type === 'instruction_text' ? (
                  <p className="text-sm text-wolf-600 bg-wolf-50 p-3 rounded-lg">
                    {field.label}
                  </p>
                ) : field.type === 'textarea' ? (
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">
                      {field.label}
                      {field.validation?.required && <span className="text-danger ml-1">*</span>}
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-wolf-300 rounded-lg"
                      placeholder={field.placeholder}
                      rows={3}
                      disabled
                    />
                  </div>
                ) : field.type === 'dropdown' ? (
                  <Select
                    label={field.label}
                    options={field.options?.map(o => ({ value: o.value, label: o.label })) || []}
                    disabled
                  />
                ) : field.type === 'toggle' ? (
                  <Toggle label={field.label} disabled />
                ) : field.type === 'signature' ? (
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">
                      {field.label}
                      {field.validation?.required && <span className="text-danger ml-1">*</span>}
                    </label>
                    <div className="h-32 border-2 border-dashed border-wolf-300 rounded-lg flex items-center justify-center">
                      <span className="text-wolf-400">Signature area</span>
                    </div>
                  </div>
                ) : (
                  <Input
                    label={field.label}
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    placeholder={field.placeholder}
                    disabled
                  />
                )}
              </div>
            ))}
          </div>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowPreview(false)}>
              Close Preview
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }

  // Forms List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy">Custom Forms</h1>
          <p className="text-wolf-600 mt-1">Create and manage custom data collection forms</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={startNewForm}>
          New Form
        </Button>
      </div>

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-wolf-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-navy">No forms yet</h3>
              <p className="text-wolf-600 mt-1 mb-4">
                Create your first custom form to collect data
              </p>
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={startNewForm}>
                Create Form
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <Card key={form.id} hoverable>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-navy">{form.name}</h3>
                    <p className="text-sm text-wolf-500 capitalize">
                      {form.module.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-wolf-400 mt-2">
                      {form.fields.length} fields
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    form.is_active ? 'bg-action-50 text-action' : 'bg-wolf-100 text-wolf-500'
                  }`}>
                    {form.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => editForm(form)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateForm(form)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteForm(form.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
