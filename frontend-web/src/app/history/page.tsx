'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/services/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Flame, Eye, Trash2, ArrowRight, Camera, Sparkles } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';

export default function HistoryPage() {
  const router = useRouter();
  const { token, history, fetchHistory, deleteScan, isLoading } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else {
      fetchHistory();
    }
  }, [token, router, fetchHistory]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchHistory(val); // Gọi API search trực tiếp
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện click card dẫn tới xem chi tiết
    if (confirm("Bạn có chắc chắn muốn xóa bản ghi quét thực phẩm này khỏi lịch sử không?")) {
      await deleteScan(id);
    }
  };

  if (isLoading && history.length === 0) {
    return (
      <div className="py-12 max-w-4xl mx-auto flex flex-col gap-6">
        <SkeletonLoader variant="rect" className="h-12 w-1/3" />
        <SkeletonLoader variant="rect" className="h-32" count={3} />
      </div>
    );
  }

  return (
    <div className="py-6 max-w-4xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Nhật Ký Quét Thực Phẩm <Sparkles className="w-5 h-5 text-premium-green" />
          </h1>
          <p className="text-xs text-gray-400">Xem lại các món ăn và hàm lượng dinh dưỡng bạn đã phân tích.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Tìm kiếm món ăn trong nhật ký của bạn..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-12 pr-4 py-3.5 bg-premium-card/65 border border-premium-border/40 text-white rounded-2xl text-sm focus:outline-none focus:border-premium-green/60 transition-all font-medium backdrop-blur-md"
        />
      </div>

      {/* History List */}
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {history.map((scan) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard 
                onClick={() => router.push(`/scan?resultId=${scan.id}`)} // (Tải mock lên scan screen bằng query param nếu cần, hoặc chỉ hiển thị chi tiết)
                className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                {/* Left: Food Image & Name */}
                <div className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-premium-border/20">
                    <img src={scan.image_url || ''} className="w-full h-full object-cover" alt={scan.food_name} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-extrabold text-white">{scan.food_name}</h3>
                    <span className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> 
                      {new Date(scan.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Center: Nutrition metrics summary */}
                <div className="flex gap-4 self-stretch sm:self-auto justify-around bg-premium-border/10 p-2.5 rounded-xl border border-premium-border/20 text-center sm:px-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Calories</span>
                    <span className="text-xs font-black text-premium-green mt-0.5">{scan.calories} Kcal</span>
                  </div>
                  <div className="w-px bg-premium-border/40 h-8 self-center" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Carb</span>
                    <span className="text-xs font-bold text-white mt-0.5">{scan.carbs}g</span>
                  </div>
                  <div className="w-px bg-premium-border/40 h-8 self-center" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Đạm</span>
                    <span className="text-xs font-bold text-white mt-0.5">{scan.protein}g</span>
                  </div>
                  <div className="w-px bg-premium-border/40 h-8 self-center" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Béo</span>
                    <span className="text-xs font-bold text-white mt-0.5">{scan.fat}g</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex gap-2 self-end sm:self-auto">
                  <button
                    onClick={(e) => handleDelete(scan.id, e)}
                    className="p-2.5 bg-premium-border/40 hover:bg-premium-rose/10 text-gray-500 hover:text-premium-rose rounded-xl border border-premium-border/20 transition-all"
                    title="Xóa khỏi nhật ký"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2.5 bg-premium-green/10 hover:bg-premium-green/20 text-premium-green rounded-xl border border-premium-green/30 transition-all flex items-center justify-center"
                    title="Xem chi tiết"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>

        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 glassmorphism rounded-3xl">
            <Camera className="w-12 h-12 text-gray-500" />
            <div>
              <h3 className="text-lg font-bold text-white">Chưa có lịch sử quét món ăn</h3>
              <p className="text-xs text-gray-400 mt-1">Bắt đầu quét món ăn đầu tiên của bạn để lưu lịch sử dinh dưỡng.</p>
            </div>
            <button
              onClick={() => router.push('/scan')}
              className="px-6 py-2.5 bg-premium-green text-white font-extrabold rounded-xl shadow-glow text-sm transition mt-2"
            >
              Bắt đầu quét
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
