'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown, MoreHorizontal } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleModal({ isOpen, onClose }: ScheduleModalProps) {
  const [currentMonth] = useState('СІЧЕНЬ');

  // Генеруємо дні місяця (1-31)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Поточний день і важливі дати
  const today = 28;
  const importantDates = [22, 23, 24, 25, 26, 28];

  // Блокуємо скрол body коли модалка відкрита
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup при unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed mb-0 inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-sm">
      <div className="w-full flex flex-col h-full">
        {/* Header - Above modal */}
        <div className="flex items-center justify-between px-4 py-3 pt-10 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-white hover:text-white/80 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
            <span className="font-medium">Закрыть</span>
          </button>
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
            <ChevronDown className="w-5 h-5 text-white" />
            <MoreHorizontal className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Modal Content */}
        <div className="bg-white mx-4 rounded-t-3xl shadow-2xl overflow-hidden flex flex-col flex-1">
          {/* Calendar and Content - Scrollable */}
          <div className="flex-1 overflow-y-auto pb-20">
            <div className="p-4">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#10A3FE] to-[#2173FF] p-4">
              {/* Month title */}
              <h3 className="text-white text-xl font-bold text-center mb-4">
                {currentMonth}
              </h3>

              {/* Calendar grid line */}
              <div className="border-t border-white/30 mb-4" />

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for alignment (assuming month starts on Monday) */}
                {[...Array(5)].map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Days */}
                {daysInMonth.map((day) => {
                  const isToday = day === today;
                  const isImportant = importantDates.includes(day);

                  return (
                    <button
                      key={day}
                      className={`
                        aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all
                        ${isToday 
                          ? 'bg-white text-[#2173FF] shadow-lg' 
                          : isImportant 
                            ? 'bg-white/20 text-white hover:bg-white/30' 
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule section */}
            <div className="mt-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-3">
                Розклад на тиждень
              </h2>

              <div className="space-y-4 text-sm">
                {/* Event 1 */}
                <div>
                  <p className="text-gray-600 mb-1">
                    23 січня (четвер) о 19:00 у Європі, 20:00 у Києві
                  </p>
                  <p className="font-bold text-gray-900">
                    Эфир с ответами на вопросы
                  </p>
                </div>

                {/* Event 2 */}
                <div>
                  <p className="text-gray-600 mb-1">
                    22-26 січня (вівторок-неділя)
                  </p>
                  <p className="font-bold text-gray-900">
                    Знайомство з кураторами
                  </p>
                </div>

                {/* Event 3 */}
                <div>
                  <p className="text-gray-600 mb-1">
                    28 січня (вівторок) о 17:00 у Європі, 18:00 у Києві
                  </p>
                  <p className="font-bold text-gray-900">
                    Відкриття спільного чату⭐
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    (у цей день ми опублікуємо правила чату та посилання на нього, а також рекомендації, як правильно підготувати вашу самопрезентацію)
                  </p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
