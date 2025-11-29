const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export interface FavoriteLesson {
  moduleId: string;
  moduleNumber: number;
  moduleTitle: string;
  lessonNumber: number;
  lessonTitle: string;
  videoUrl: string;
  description: string;
  duration: number;
  isCompleted: boolean;
  addedAt: string;
}

export const favoritesService = {
  async addToFavorites(moduleId: string, lessonNumber: number): Promise<{ success: boolean; lesson: any }> {
    const response = await fetch(`${API_URL}/favorites/${moduleId}/${lessonNumber}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Не вдалося додати в обране');
    }

    return response.json();
  },

  async removeFromFavorites(moduleId: string, lessonNumber: number): Promise<{ success: boolean; lesson: any }> {
    const response = await fetch(`${API_URL}/favorites/${moduleId}/${lessonNumber}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Не вдалося видалити з обраного');
    }

    return response.json();
  },

  async getFavorites(): Promise<{ favorites: FavoriteLesson[]; total: number }> {
    const response = await fetch(`${API_URL}/favorites`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Не вдалося отримати обрані уроки');
    }

    return response.json();
  },

  async checkIsFavorite(moduleId: string, lessonNumber: number): Promise<boolean> {
    const response = await fetch(`${API_URL}/favorites/${moduleId}/${lessonNumber}/check`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isFavorite;
  },
};
