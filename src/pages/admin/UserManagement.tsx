import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, Button, Badge, Input, Select } from '../../components/ui';
import { ArrowLeft, Plus, Search, Edit2, Trash2, Users, X, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { getUsers, saveUser, deleteUser } from '../../services/admin-service';
import type { User, UserRole } from '../../types';

export function UserManagement() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setIsLoading(true);
    const data = await getUsers();
    setUsers(data);
    setIsLoading(false);
  }

  const roleOptions = [
    { value: 'facility_manager', label: 'Facility Manager' },
    { value: 'lead_ice_tech', label: 'Lead Ice Technician' },
    { value: 'ice_technician', label: 'Ice Technician' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'attendant', label: 'Attendant' },
  ];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'facility_manager':
        return 'ideal';
      case 'lead_ice_tech':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!editingUser) return;

    if (!editingUser.full_name || !editingUser.email) {
      showError('Missing Information', 'Please enter name and email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveUser(editingUser);
      success('User Saved', editingUser.id ? 'User updated successfully.' : 'User created successfully.');
      setEditingUser(null);
      await loadUsers();
    } catch {
      showError('Save Failed', 'Failed to save user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteUser(id);
      success('User Deleted', 'User has been removed.');
      await loadUsers();
    } catch {
      showError('Delete Failed', 'Failed to delete user.');
    }
  };

  const startEditing = (user?: User) => {
    if (user) {
      setEditingUser({ ...user });
    } else {
      setEditingUser({
        full_name: '',
        email: '',
        role: 'ice_technician',
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
            <h1 className="text-2xl font-display font-bold text-navy">User Management</h1>
            <p className="text-wolf-600 mt-1">Manage staff accounts and permissions</p>
          </div>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => startEditing()}>
          Add User
        </Button>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <Card className="border-2 border-action">
          <CardHeader
            title={editingUser.id ? 'Edit User' : 'Add New User'}
            action={
              <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}>
                <X className="h-4 w-4" />
              </Button>
            }
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={editingUser.full_name || ''}
                onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                placeholder="e.g., John Smith"
                required
              />
              <Input
                label="Email"
                type="email"
                value={editingUser.email || ''}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                placeholder="e.g., john@facility.com"
                required
              />
              <Select
                label="Role"
                options={roleOptions}
                value={editingUser.role || 'ice_technician'}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
              />
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="user_active"
                  checked={editingUser.is_active !== false}
                  onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-wolf-300 text-action focus:ring-action"
                />
                <label htmlFor="user_active" className="text-sm font-medium text-navy">
                  Active
                </label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} isLoading={isSubmitting}>
              Save User
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-wolf-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-wolf-300 focus:border-navy focus:ring-2 focus:ring-navy-200 focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      {isLoading ? (
        <div className="text-center py-12 text-wolf-500">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-wolf-400 mx-auto mb-4" />
              <h3 className="text-lg font-display font-semibold text-navy mb-2">
                {searchTerm ? 'No users found' : 'No users configured'}
              </h3>
              <p className="text-wolf-600 mb-4">
                {searchTerm ? 'Try a different search term.' : 'Add your first user to get started.'}
              </p>
              {!searchTerm && (
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => startEditing()}>
                  Add User
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader title="Users" description={`${filteredUsers.length} total users`} />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-wolf-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-navy">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-wolf-100 hover:bg-wolf-50">
                      <td className="py-3 px-4 text-sm font-medium text-navy">{user.full_name}</td>
                      <td className="py-3 px-4 text-sm text-wolf-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {formatRole(user.role)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={user.is_active ? 'ideal' : 'default'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => startEditing(user)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-red-50"
                            onClick={() => handleDelete(user.id)}
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
