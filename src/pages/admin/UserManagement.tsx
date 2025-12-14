import { useState } from 'react';
import { Card, CardHeader, CardContent, Button, Badge } from '../../components/ui';
import { ArrowLeft, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UserManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Demo data
  const users = [
    {
      id: '1',
      full_name: 'John Smith',
      email: 'john.smith@facility.com',
      role: 'facility_manager',
      is_active: true,
    },
    {
      id: '2',
      full_name: 'Jane Doe',
      email: 'jane.doe@facility.com',
      role: 'lead_ice_tech',
      is_active: true,
    },
    {
      id: '3',
      full_name: 'Bob Wilson',
      email: 'bob.wilson@facility.com',
      role: 'ice_technician',
      is_active: true,
    },
    {
      id: '4',
      full_name: 'Alice Brown',
      email: 'alice.brown@facility.com',
      role: 'attendant',
      is_active: false,
    },
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
        <Button leftIcon={<Plus className="h-4 w-4" />}>Add User</Button>
      </div>

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
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-danger hover:bg-red-50">
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
    </div>
  );
}
