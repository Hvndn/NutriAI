'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/services/store';
import { motion } from 'framer-motion';
import { Camera, Edit2, Flame, Award, Apple, ChevronRight, Activity, Sparkles, Download } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import DailyRing from '@/components/DailyRing';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, dailyTracker, fetchDailyTracker, updateDailyGoal, isLoading } = useAppStore();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState<number>(2000);

  // Bảo vệ Router
  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else {
      fetchDailyTracker();
    }
  }, [token, router, fetchDailyTracker]);

  useEffect(() => {
    if (user) {
      setNewGoal(user.daily_calorie_goal);
    }
  }, [user]);

  const handleUpdateGoal = async () => {
    await updateDailyGoal(newGoal);
    setShowGoalModal(false);
  };

  const handlePrintReport = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!user || !dailyTracker) {
    return (
      <div className="py-12 max-w-4xl mx-auto flex flex-col gap-6">
        <SkeletonLoader variant="rect" className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonLoader variant="rect" className="h-64" />
          <SkeletonLoader variant="rect" className="h-64 col-span-2" />
        </div>
      </div>
    );
  }

  const percentage = (dailyTracker.calories_consumed / dailyTracker.calories_goal) * 100;
  
  return (
    <div className="py-6 flex flex-col gap-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Xin chào, {user.full_name || 'Bạn'} <Sparkles className="w-6 h-6 text-premium-green" />
          </h1>
          <p className="text-sm text-gray-400 mt-1">Hôm nay là một ngày tuyệt vời để ăn uống lành mạnh!</p>
        </div>
        <div className="flex gap-3 self-stretch md:self-auto w-full md:w-auto">
          <button
            onClick={handlePrintReport}
            className="flex-1 md:flex-none px-6 py-3.5 bg-premium-border/40 hover:bg-premium-border/60 text-white font-bold rounded-2xl border border-premium-border/50 transition hover:scale-103 active:scale-97 flex items-center justify-center gap-2 text-center"
          >
            <Download className="w-5 h-5" />
            Xuất Báo Cáo PDF
          </button>
          <button
            onClick={() => router.push('/scan')}
            className="flex-1 md:flex-none px-6 py-3.5 bg-premium-green hover:bg-premium-green/85 text-white font-extrabold rounded-2xl shadow-glow transition hover:scale-103 active:scale-97 flex items-center gap-2 text-center justify-center"
          >
            <Camera className="w-5 h-5" />
            Quét món ăn mới
          </button>
        </div>
      </div>

      {/* Trang in ẩn lúc bình thường, chỉ hiển thị khi bấm Print */}
      <div className="hidden print:flex flex-col gap-6 p-8 bg-white text-black min-h-screen w-full rounded-none">
        <div className="border-b-2 border-green-500 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-green-600 tracking-tight">NutriAI Report</h1>
            <p className="text-sm text-gray-500 mt-1">Báo cáo phân tích dinh dưỡng cá nhân hàng ngày</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">{user.full_name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-500">Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-6">
          <div className="border border-gray-200 rounded-2xl p-6 flex flex-col justify-center items-center">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Calories Đã Nạp</span>
            <span className="text-5xl font-black text-green-600 mt-2">{Math.round(dailyTracker.calories_consumed)} Kcal</span>
            <span className="text-xs text-gray-400 mt-1">mục tiêu {user.daily_calorie_goal} kcal ({Math.round(percentage)}%)</span>
          </div>

          <div className="flex flex-col gap-4 justify-center">
            <div className="flex justify-between border-b pb-2">
              <span className="font-bold text-gray-600">Tinh bột (Carbs):</span>
              <span className="font-black">{dailyTracker.carbs_grams.toFixed(1)}g</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-bold text-gray-600">Chất đạm (Protein):</span>
              <span className="font-black">{dailyTracker.protein_grams.toFixed(1)}g</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-bold text-gray-600">Chất béo (Fat):</span>
              <span className="font-black">{dailyTracker.fat_grams.toFixed(1)}g</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-gray-600">Số lượng bữa ăn đã quét:</span>
              <span className="font-black">{dailyTracker.scans_count} món</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-6">
          <h4 className="text-lg font-bold text-green-800">Đánh giá sức khỏe tổng quan</h4>
          <p className="text-sm text-green-700 leading-relaxed mt-2">
            {dailyTracker.scans_count === 0 
              ? "Chưa có dữ liệu bữa ăn hôm nay."
              : dailyTracker.calories_consumed > dailyTracker.calories_goal 
              ? "Bạn đã tiêu thụ vượt quá hạn mức calories. Hãy điều chỉnh khẩu phần ăn vào ngày mai và kết hợp tập luyện nhẹ để duy trì cân nặng ổn định."
              : "Bữa ăn hôm nay đạt tỉ lệ cân bằng lý tưởng. Hàm lượng đạm nạp vào giúp tái tạo mô cơ tốt, lượng tinh bột và chất béo được kiểm soát hiệu quả."}
          </p>
        </div>

        <div className="mt-auto border-t pt-4 text-center text-xs text-gray-400">
          Báo cáo tự động được xuất bởi nền tảng NutriAI 2026.
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Calorie Activity Ring */}
        <GlassCard className="flex flex-col items-center justify-center py-10 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowGoalModal(true)}
              className="p-2 hover:bg-premium-border/40 text-gray-400 hover:text-white rounded-xl border border-premium-border/20 transition-all"
              title="Chỉnh sửa mục tiêu calo"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          
          <DailyRing 
            value={dailyTracker.calories_consumed} 
            target={dailyTracker.calories_goal} 
          />
        </GlassCard>

        {/* Center/Right: Nutrition details & Cards */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Carb Card */}
            <GlassCard className="flex flex-col justify-between h-40 border-l-4 border-l-premium-accent">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tinh bột (Carb)</span>
              <div>
                <span className="text-3xl font-black text-white">{dailyTracker.carbs_grams.toFixed(1)}g</span>
                <div className="w-full bg-premium-border/30 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-premium-accent h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (dailyTracker.carbs_grams / 250) * 100)}%` }}
                  />
                </div>
              </div>
            </GlassCard>

            {/* Protein Card */}
            <GlassCard className="flex flex-col justify-between h-40 border-l-4 border-l-premium-green">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chất đạm (Protein)</span>
              <div>
                <span className="text-3xl font-black text-white">{dailyTracker.protein_grams.toFixed(1)}g</span>
                <div className="w-full bg-premium-border/30 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-premium-green h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (dailyTracker.protein_grams / 120) * 100)}%` }}
                  />
                </div>
              </div>
            </GlassCard>

            {/* Fat Card */}
            <GlassCard className="flex flex-col justify-between h-40 border-l-4 border-l-premium-lime">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chất béo (Fat)</span>
              <div>
                <span className="text-3xl font-black text-white">{dailyTracker.fat_grams.toFixed(1)}g</span>
                <div className="w-full bg-premium-border/30 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-premium-lime h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (dailyTracker.fat_grams / 70) * 100)}%` }}
                  />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Daily Advice / Analytics */}
          <GlassCard className="flex gap-4 items-start">
            <div className="p-3 bg-premium-green/10 text-premium-green rounded-2xl shrink-0">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-lg font-bold text-white">Đánh giá chế độ ăn hôm nay</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                {dailyTracker.scans_count === 0 
                  ? "Bạn chưa quét món ăn nào hôm nay. Hãy chụp ảnh bữa ăn của bạn để AI phân tích và đưa ra lời khuyên cá nhân hóa nhé!"
                  : dailyTracker.calories_consumed > dailyTracker.calories_goal 
                  ? "⚠️ Bạn đã vượt quá mục tiêu calories hôm nay. Hãy tăng cường vận động nhẹ hoặc đi bộ để tiêu hao bớt năng lượng dư thừa."
                  : `🎉 Tuyệt vời! Bạn đã hoàn thành ${Math.round(percentage)}% hạn mức calories. Lượng đạm nạp vào khá tốt giúp săn chắc cơ bắp.`}
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Goal Modal (iOS Glass Style) */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-premium-dark/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm glassmorphism rounded-3xl p-6 flex flex-col gap-4"
          >
            <h3 className="text-xl font-bold text-white">Mục tiêu Calories hàng ngày</h3>
            <p className="text-xs text-gray-400">Thay đổi lượng calories nạp vào phù hợp với mục tiêu giảm cân hay tăng cơ của bạn.</p>
            
            <div className="relative mt-2">
              <Flame className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-premium-green" />
              <input
                type="number"
                value={newGoal}
                onChange={(e) => setNewGoal(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-3 bg-premium-border/30 border border-premium-border/50 text-white rounded-2xl text-sm focus:outline-none focus:border-premium-green/60 focus:bg-premium-border/50 transition-all font-bold"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 py-3 bg-premium-border/40 hover:bg-premium-border/60 text-gray-300 font-bold rounded-xl transition text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateGoal}
                className="flex-1 py-3 bg-premium-green hover:bg-premium-green/85 text-white font-extrabold rounded-xl transition text-sm shadow-glow"
              >
                Lưu lại
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
