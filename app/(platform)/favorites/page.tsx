'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Play, ChevronDown } from 'lucide-react';
import { favoritesService, FavoriteLesson } from '@/lib/services/favorites.service';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteLesson[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    filterFavorites();
  }, [searchQuery, selectedModule, favorites]);

  const loadFavorites = async () => {
    try {
      const data = await favoritesService.getFavorites();
      setFavorites(data.favorites);
      setFilteredFavorites(data.favorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFavorites = () => {
    let filtered = favorites;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(fav =>
        fav.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fav.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected module
    if (selectedModule !== 'all') {
      filtered = filtered.filter(fav => fav.moduleNumber.toString() === selectedModule);
    }

    setFilteredFavorites(filtered);
  };

  // Get unique modules from favorites
  const modules = Array.from(new Set(favorites.map(fav => fav.moduleNumber)))
    .sort((a, b) => a - b);

  const handleLessonClick = (moduleId: string, lessonNumber: number) => {
    router.push(`/modules/${moduleId}/lessons/${lessonNumber}`);
  };

  // Helper function to extract YouTube video ID
  const getYouTubeVideoId = (url: string) => {
    if (!url) return '';
    
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        return urlParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        const path = url.split('youtu.be/')[1];
        return path.split('?')[0].split('/')[0] || '';
      }
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
    }
    
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2466FF] mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] pb-24">
      <div className="max-w-md mx-auto">
        {/* Header with Back Button */}
        <div className="bg-white pb-4 border-b border-gray-200 rounded-b-2xl shadow-sm">
          <div className="px-4 pt-6">
            {/* Back Button */}
            <button
              onClick={() => router.push('/home')}
              className="w-10 h-10 rounded-full bg-[#F0F0F0] flex items-center justify-center mb-4 hover:bg-gray-200 transition-colors"
            >
              <ChevronDown className="w-5 h-5 text-black rotate-90" />
            </button>

            {/* Title */}
            <h1 className="text-2xl font-bold text-black mb-2">
              Обране
            </h1>
            <p className="text-sm text-gray-500">
              {favorites.length === 0 
                ? 'Додайте уроки в обране для швидкого доступу'
                : `${favorites.length} ${favorites.length === 1 ? 'урок' : favorites.length < 5 ? 'уроки' : 'уроків'}`
              }
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl p-4 space-y-4">

            {/* Search Bar */}
            <div className="bg-[#F0F0F0] rounded-2xl px-4 py-3 flex items-center gap-3">
              <Search className="w-5 h-5 text-[#99A1AF] flex-shrink-0" />
              <input
                type="text"
                placeholder="Пошук по обраним урокам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent flex-1 text-sm text-black placeholder:text-[#99A1AF] outline-none"
              />
            </div>

            {/* Filter Buttons */}
            {modules.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setSelectedModule('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedModule === 'all'
                      ? 'bg-black text-white shadow-md'
                      : 'bg-[#F0F0F0] text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Всі ({favorites.length})
                </button>
                {modules.map((moduleNum) => {
                  const count = favorites.filter(f => f.moduleNumber === moduleNum).length;
                  return (
                    <button
                      key={moduleNum}
                      onClick={() => setSelectedModule(moduleNum.toString())}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        selectedModule === moduleNum.toString()
                          ? 'bg-black text-white shadow-md'
                          : 'bg-[#F0F0F0] text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Модуль {moduleNum} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Favorites List */}
            {filteredFavorites.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {searchQuery || selectedModule !== 'all' 
                    ? 'Нічого не знайдено'
                    : 'Ще немає обраних уроків'
                  }
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchQuery || selectedModule !== 'all' 
                    ? 'Спробуйте змінити фільтри або пошуковий запит'
                    : 'Натисніть ♥ на сторінці уроку, щоб додати його сюди'
                  }
                </p>
                {(searchQuery || selectedModule !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedModule('all');
                    }}
                    className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Скинути фільтри
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFavorites.map((favorite) => (
                  <div
                    key={`${favorite.moduleId}-${favorite.lessonNumber}`}
                    onClick={() => handleLessonClick(favorite.moduleId, favorite.lessonNumber)}
                    className="relative cursor-pointer group"
                  >
                    {/* Video Thumbnail */}
                    <div className="relative h-[200px] rounded-2xl overflow-hidden bg-black shadow-md group-hover:shadow-xl transition-shadow">
                      {favorite.videoUrl ? (
                        <>
                          <img 
                            src={`https://img.youtube.com/vi/${getYouTubeVideoId(favorite.videoUrl)}/maxresdefault.jpg`}
                            alt={favorite.lessonTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = `https://img.youtube.com/vi/${getYouTubeVideoId(favorite.videoUrl)}/hqdefault.jpg`;
                            }}
                          />
                          {/* Dark overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          
                          {/* Play button */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-[#2466FF] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                              <Play className="w-6 h-6 text-white fill-white ml-1" />
                            </div>
                          </div>

                          {/* e-launch watermark */}
                          <div className="absolute top-3 left-3">
                            <span className="text-white text-xs font-light tracking-wider drop-shadow-lg bg-black/20 px-2 py-1 rounded">e-launch</span>
                          </div>

                          {/* Module badge */}
                          <div className="absolute top-3 right-3">
                            <span className="text-xs font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                              Модуль {favorite.moduleNumber}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 via-gray-900 to-gray-900" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-[#2466FF] flex items-center justify-center">
                              <Play className="w-6 h-6 text-white fill-white ml-1" />
                            </div>
                          </div>
                          <div className="absolute top-3 left-3">
                            <span className="text-white/80 text-xs font-light tracking-wider bg-black/20 px-2 py-1 rounded">e-launch</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Info Card - overlapping */}
                    <div className="relative -mt-16 mx-3 bg-white rounded-2xl p-4 shadow-lg">
                      <div className="space-y-2">
                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="bg-gray-100 rounded-full px-3 py-1">
                            <span className="text-xs font-bold text-gray-700">Урок {favorite.lessonNumber}</span>
                          </div>
                          {favorite.isCompleted && (
                            <div className="bg-green-50 rounded-full px-3 py-1">
                              <span className="text-xs font-bold text-green-600">✓ Пройдено</span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-black leading-tight">
                          {favorite.lessonTitle}
                        </h3>

                        {/* Module info */}
                        <p className="text-xs text-gray-500">
                          {favorite.moduleTitle}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
