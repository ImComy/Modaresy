import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockTutors } from '@/data/enhanced';
import EditUserForm from './editUsers';

const mockUsers = [
  { id: 'u1', name: 'Sara Ali', email: 'sara.ali@example.com', role: 'student', status: 'active' },
  { id: 'u2', name: 'Mohamed Khaled', email: 'mohamed.khaled@example.com', role: 'student', status: 'active' },
];

const USERS_PER_PAGE = 10;

const AccountManagement = () => {
  const { t } = useTranslation();

  const [users, setUsers] = useState([
    ...mockUsers,
    ...mockTutors.map((tutor) => ({
      id: tutor.id.toString(),
      name: tutor.name,
      email: tutor.socials?.email || '',
      role: 'tutor',
      status: 'active',
    })),
  ]);

  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const handleEdit = (user) => setEditingUser({ ...user });

  const handleSave = () => {
    setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
  };

  const handleBan = (id) => {
    setUsers(users.map((u) =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u
    ));
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const fieldValue = user[searchBy]?.toString().toLowerCase() || '';
      return matchesRole && fieldValue.includes(term);
    });
  }, [users, searchTerm, searchBy, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  return (
    <Card className="p-6 bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
      <h2 className="text-xl font-semibold mb-4 text-[hsl(var(--primary))]">
        {t('accountManagementTitle', 'Account Management')}
      </h2>

      {editingUser ? (
        <EditUserForm
          user={editingUser}
          onChange={setEditingUser}
          onSave={handleSave}
          onCancel={() => setEditingUser(null)}
        />
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 flex-wrap">
            <Input
              type="text"
              placeholder={t('searchPlaceholder', { field: t(searchBy) })}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-64"
            />
            <Select value={searchBy} onValueChange={(val) => { setSearchBy(val); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('searchBy', 'Search by')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t('name', 'Name')}</SelectItem>
                <SelectItem value="email">{t('email', 'Email')}</SelectItem>
                <SelectItem value="id">{t('id', 'ID')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('filterByRole', 'Filter by Role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allRoles', 'All Roles')}</SelectItem>
                <SelectItem value="student">{t('student', 'Student')}</SelectItem>
                <SelectItem value="tutor">{t('tutor', 'Tutor')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                  <th className="p-3 font-medium">{t('id', 'ID')}</th>
                  <th className="p-3 font-medium">{t('name', 'Name')}</th>
                  <th className="p-3 font-medium">{t('email', 'Email')}</th>
                  <th className="p-3 font-medium">{t('role', 'Role')}</th>
                  <th className="p-3 font-medium">{t('status', 'Status')}</th>
                  <th className="p-3 font-medium">{t('actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center italic text-[hsl(var(--muted-foreground))]">
                      {t('noUsersFound', 'No users found')}
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-[hsl(var(--border))] last:border-none">
                      <td className="p-3 font-mono text-xs">{user.id}</td>
                      <td className="p-3">{user.name}</td>
                      <td className="p-3">
                        {user.email || (
                          <span className="italic text-[hsl(var(--muted-foreground))]">
                            {t('notAvailable', 'N/A')}
                          </span>
                        )}
                      </td>
                      <td className="p-3 capitalize">{t(user.role)}</td>
                      <td className="p-3 capitalize">{t(user.status)}</td>
                      <td className="p-3 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                          {t('edit', 'Edit')}
                        </Button>
                        <Button
                          variant={user.status === 'active' ? 'destructive' : 'secondary'}
                          size="sm"
                          onClick={() => handleBan(user.id)}
                        >
                          {user.status === 'active' ? t('ban', 'Ban') : t('unban', 'Unban')}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                {t('previous', 'Previous')}
              </Button>
              <div className="flex items-center text-sm px-2 py-1 rounded-md">
                {t('pageOf', { current: currentPage, total: totalPages })}
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                {t('next', 'Next')}
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default AccountManagement;
