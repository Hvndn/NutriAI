'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/services/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Camera, Flame, ShieldAlert, Award, ToggleLeft, ToggleRight, Trash2, Calendar, Sparkles } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import api from '@/services/api';

export default function AdminPage() {
  const router = useRouter();
  const { user, token, adminStats, fetchAdminStats, isLoading } = useAppStore();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Bảo vệ router
  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Đợi store fetch user nếu cần
    if (user && !user.is_admin) {
      alert("Bạn không có quyền truy cập trang quản trị Admin Portal.");
      router.push('/dashboard');
      return;
    }

    if (user?.is_admin) {
      fetchAdminStats();
      fetchUsersList();
    }
  }, [token, user, router, fetchAdminStats]);

  const fetchUsersList = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsersList(response.data);
    } catch (err) {}
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    setActionLoading(userId);
    try {
      const response = await api.put(`/admin/users/${userId}/status?is_active=${!currentStatus}`);
      
      // Cập nhật lại list users tại chỗ
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: response.data.is_active } : u))
      );
      
      // Update lại thống kê admin dashboard
      await fetchAdminStats();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Lỗi thay đổi trạng thái người dùng.");
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || !user.is_admin || !adminStats) {
    return (
      <div className="py-12 max-w-4xl mx-auto flex flex-col gap-6">
        <SkeletonLoader variant="rect" className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonLoader variant="rect" className="h-32" />
          <SkeletonLoader variant="rect" className="h-32" />
          <SkeletonLoader variant="rect" className="h-32" />
        </div>
        <SkeletonLoader variant="rect" className="h-64" />
      </div>
    );
  }

  return (
    <div className="py-6 flex flex-col gap-10">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Hội Đồng Quản Trị <ShieldAlert className="w-8 h-8 text-premium-rose animate-pulse" />
          </h1>
          <p className="text-sm text-gray-400 mt-1">Cơ sở dữ liệu quản trị hệ thống AI Nutrition Scanner toàn cầu.</p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center gap-5 border-l-4 border-l-premium-green">
          <div className="p-4 bg-premium-green/10 text-premium-green rounded-2xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Người dùng hoạt động</span>
            <span className="text-3xl font-black text-white mt-1 block">{adminStats.total_users}</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-5 border-l-4 border-l-premium-accent">
          <div className="p-4 bg-premium-accent/10 text-premium-accent rounded-2xl">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Tổng số lượt quét AI</span>
            <span className="text-3xl font-black text-white mt-1 block">{adminStats.total_scans}</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-5 border-l-4 border-l-premium-lime">
          <div className="p-4 bg-premium-lime/10 text-premium-lime rounded-2xl">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Calo trung bình / món</span>
            <span className="text-3xl font-black text-white mt-1 block">{adminStats.average_calories} kcal</span>
          </div>
        </GlassCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Biểu đồ lượt scan 7 ngày qua (Vẽ CSS Cột Cực đẹp) */}
        <GlassCard className="lg:col-span-2 flex flex-col gap-6 p-6">
          <div>
            <h3 className="text-lg font-bold text-white">Lượt Quét Thực Phẩm Hàng Ngày</h3>
            <p className="text-xs text-gray-400 mt-0.5">Biểu đồ thống kê lượt quét trong vòng 7 ngày qua.</p>
          </div>
          
          <div className="h-60 flex items-end justify-between gap-2 pt-6 px-4">
            {adminStats.scan_growth.map((item, idx) => {
              const maxScans = Math.max(...adminStats.scan_growth.map(x => x.scans), 10);
              const heightPercent = (item.scans / maxScans) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                  <div className="text-xs font-black text-premium-green">{item.scans}</div>
                  
                  {/* Cột dữ liệu */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="w-full bg-gradient-to-t from-premium-green/40 to-premium-green rounded-t-lg shadow-glow min-h-[4px]"
                  />
                  
                  <span className="text-[10px] text-gray-400 font-bold block">{item.date}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Top Món Ăn Phổ Biến */}
        <GlassCard className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-white">Top Món Ăn Quét Nhiều</h3>
            <p className="text-xs text-gray-400 mt-0.5">Danh sách các món ăn phổ biến nhất hệ thống.</p>
          </div>
          
          <div className="flex flex-col gap-4">
            {adminStats.top_foods.map((food, index) => (
              <div key={index} className="flex justify-between items-center bg-premium-border/20 p-3.5 rounded-2xl border border-premium-border/20">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-premium-green/10 text-premium-green flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold text-white truncate max-w-[150px]">{food.food_name}</span>
                </div>
                <span className="text-xs font-black text-premium-green bg-premium-green/10 px-2 py-0.5 rounded-lg border border-premium-green/20">
                  {food.scan_count} lượt
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* User Management Table */}
      <GlassCard className="flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-white">Quản Lý Thành Viên</h3>
          <p className="text-xs text-gray-400 mt-0.5">Khóa tài khoản hoặc phê duyệt người dùng hệ thống.</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-premium-border/50 text-gray-400 text-xs uppercase font-extrabold tracking-wider">
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Ngày Tham Gia</th>
                <th className="py-3 px-4">Mục Tiêu Calo</th>
                <th className="py-3 px-4 text-center">Vai Trò</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((usr) => (
                <tr key={usr.id} className="border-b border-premium-border/30 hover:bg-premium-border/10 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{usr.full_name || 'Không tên'}</td>
                  <td className="py-3.5 px-4 text-gray-300 font-semibold">{usr.email}</td>
                  <td className="py-3.5 px-4 text-gray-400 font-medium">
                    {new Date(usr.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3.5 px-4 text-premium-green font-bold">{usr.daily_calorie_goal} kcal</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                      usr.is_admin ? 'bg-premium-rose/10 text-premium-rose border border-premium-rose/25' : 'bg-premium-border/50 text-gray-400'
                    }`}>
                      {usr.is_admin ? 'ADMIN' : 'USER'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleUserStatus(usr.id, usr.is_active)}
                      disabled={actionLoading === usr.id || usr.id === user.id}
                      className={`p-1 rounded-xl transition ${
                        usr.is_active ? 'text-premium-green hover:bg-premium-green/10' : 'text-premium-rose hover:bg-premium-rose/10'
                      }`}
                      title={usr.is_active ? 'Đang hoạt động - Click để Khóa' : 'Đã Khóa - Click để Mở'}
                    >
                      {usr.is_active ? (
                        <div className="flex items-center gap-1 font-bold text-xs text-premium-green">
                          <ToggleRight className="w-7 h-7" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 font-bold text-xs text-premium-rose">
                          <ToggleLeft className="w-7 h-7" />
                        </div>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
