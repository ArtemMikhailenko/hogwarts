'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, User, Award } from 'lucide-react';
import { adminService, User as AdminUser } from '@/lib/services/admin.service';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');

  const faculties = ['Продюсер', 'Експерт', 'Досвідчений'];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignFaculty = async (userId: string, faculty: string) => {
    try {
      await adminService.assignFaculty(userId, faculty);
      // Оновлюємо локальний стан
      setUsers(users.map(user => 
        user.id === userId ? { ...user, faculty } : user
      ));
      setSelectedUser(null);
      setSelectedFaculty('');
    } catch (error) {
      console.error('Failed to assign faculty:', error);
      alert('Помилка призначення факультету');
    }
  };

  const handleToggleAdmin = async (userId: string) => {
    try {
      const result = await adminService.toggleAdmin(userId);
      // Оновлюємо локальний стан
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: result.isAdmin } : user
      ));
    } catch (error) {
      console.error('Failed to toggle admin:', error);
      alert('Помилка зміни прав адміністратора');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] max-w-md mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2466FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-black">Управління користувачами</h1>
      </div>

      {/* Список користувачів */}
      <div className="p-4 space-y-3">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base text-black">
                    {user.firstName} {user.lastName}
                  </h3>
                  {user.isAdmin && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      Адмін
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{user.email}</p>
                {user.phone && (
                  <p className="text-sm text-gray-500">{user.phone}</p>
                )}
              </div>
            </div>

            {/* Факультет */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Факультет
              </label>
              {selectedUser === user.id ? (
                <div className="space-y-2">
                  <select
                    value={selectedFaculty}
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2466FF]"
                  >
                    <option value="">Виберіть факультет</option>
                    {faculties.map(faculty => (
                      <option key={faculty} value={faculty}>
                        {faculty}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAssignFaculty(user.id, selectedFaculty)}
                      disabled={!selectedFaculty}
                      className="flex-1 px-4 py-2 bg-[#2466FF] text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1557ee] transition-colors"
                    >
                      Зберегти
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setSelectedFaculty('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Скасувати
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  {user.faculty ? (
                    <span className="px-3 py-1.5 bg-[#E9F0FF] text-[#2466FF] text-sm font-medium rounded-full">
                      {user.faculty}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Не призначено</span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedUser(user.id);
                      setSelectedFaculty(user.faculty || '');
                    }}
                    className="text-sm text-[#2466FF] font-medium hover:underline"
                  >
                    Змінити
                  </button>
                </div>
              )}
            </div>

            {/* Статистика */}
            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-600">
                  {user.completedModulesCount} модулів
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-600">
                  $ {user.earnings.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Дії адміна */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => handleToggleAdmin(user.id)}
                className="text-sm text-gray-600 hover:text-[#2466FF] font-medium transition-colors"
              >
                {user.isAdmin ? 'Забрати права адміна' : 'Надати права адміна'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
