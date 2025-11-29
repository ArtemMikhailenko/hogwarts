import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  faculty?: string;
  isAdmin: boolean;
  earnings: number;
  completedLessonsCount: number;
  completedModulesCount: number;
}

export const adminService = {
  async getAllUsers(): Promise<User[]> {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async assignFaculty(userId: string, faculty: string): Promise<User> {
    const response = await axios.put(
      `${API_URL}/admin/users/${userId}/faculty`,
      { faculty },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async toggleAdmin(userId: string): Promise<{ id: string; email: string; isAdmin: boolean }> {
    const response = await axios.put(
      `${API_URL}/admin/users/${userId}/admin`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
};
