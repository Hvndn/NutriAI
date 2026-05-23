'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/services/store';
import { motion } from 'framer-motion';
import { Lock, Mail, Apple, ArrowRight } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading, error } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Nếu đã đăng nhập từ trước, redirect thẳng về Dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email || !password) {
      setValidationError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="relative py-12 flex justify-center items-center min-h-[75vh]">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-premium-green/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard className="flex flex-col gap-6 p-8 md:p-10">
          <div className="text-center flex flex-col gap-2">
            <div className="mx-auto p-3 bg-gradient-to-br from-premium-green to-premium-lime rounded-2xl w-fit shadow-glow">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-2">Chào Mừng Trở Lại</h2>
            <p className="text-sm text-gray-400">Đăng nhập tài khoản để tiếp tục quét thực phẩm.</p>
          </div>

          {/* Hiển thị lỗi từ backend hoặc frontend validation */}
          {(error || validationError) && (
            <div className="p-4 bg-premium-rose/10 border border-premium-rose/30 text-premium-rose rounded-2xl text-xs font-bold leading-relaxed">
              ⚠️ {error || validationError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Input Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Email của bạn</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-premium-border/30 border border-premium-border/50 text-white rounded-2xl text-sm focus:outline-none focus:border-premium-green/60 focus:bg-premium-border/50 transition-all font-medium"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Mật khẩu</label>
                <Link href="#" className="text-xs font-bold text-premium-green hover:underline">Quên mật khẩu?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-premium-border/30 border border-premium-border/50 text-white rounded-2xl text-sm focus:outline-none focus:border-premium-green/60 focus:bg-premium-border/50 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-premium-green hover:bg-premium-green/85 text-white font-extrabold rounded-2xl shadow-glow transition hover:scale-102 active:scale-98 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 mt-2">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-bold text-premium-green hover:underline">
              Đăng ký miễn phí
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
