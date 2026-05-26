'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/services/store';
import { Camera, LayoutDashboard, History, ShieldAlert, LogOut, Menu, X, Apple, Globe, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, language, setLanguage, theme, toggleTheme, initTheme } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { 
      name: language === 'vi' ? 'Dashboard' : 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      name: language === 'vi' ? 'Quét AI' : 'AI Scan', 
      path: '/scan', 
      icon: Camera 
    },
    { 
      name: language === 'vi' ? 'Lịch sử' : 'History', 
      path: '/history', 
      icon: History 
    },
  ];

  // Nếu user là admin -> hiển thị nút Admin Portal
  if (user?.is_admin) {
    navItems.push({ 
      name: language === 'vi' ? 'Admin' : 'Admin Portal', 
      path: '/admin', 
      icon: ShieldAlert 
    });
  }

  const isLinkActive = (path: string) => pathname === path;

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-premium-dark/85 border-b border-premium-border/40 px-6 py-4 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-premium-green to-premium-lime rounded-xl shadow-glow">
              <Apple className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Nutri<span className="text-premium-green">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-1 bg-premium-border/20 p-1 rounded-2xl border border-premium-border/30">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isLinkActive(item.path)
                        ? 'bg-premium-green text-white shadow-glow'
                        : 'text-gray-400 hover:text-white hover:bg-premium-border/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Section: Language + User Profile & Logout */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="p-2 bg-premium-border/30 hover:bg-premium-border/50 text-gray-300 hover:text-white rounded-xl border border-premium-border/30 transition-all text-xs font-black flex items-center gap-1.5"
              title="Đổi ngôn ngữ / Change language"
            >
              <Globe className="w-4 h-4 text-premium-green" />
              {language === 'vi' ? 'VI 🇻🇳' : 'EN 🇬🇧'}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 bg-premium-border/30 hover:bg-premium-border/50 text-gray-300 hover:text-white rounded-xl border border-premium-border/30 transition-all text-xs font-black flex items-center gap-1.5"
              title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
              <span className="text-[10px] uppercase font-black">{theme === 'dark' ? 'DARK' : 'LIGHT'}</span>
            </button>

            {user ? (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-white">{user.full_name || 'Người dùng'}</span>
                  <span className="text-xs text-gray-400">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 bg-premium-border/40 hover:bg-premium-rose/20 text-gray-400 hover:text-premium-rose rounded-xl border border-premium-border/30 transition-all"
                  title={language === 'vi' ? 'Đăng xuất' : 'Logout'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-white transition">
                  {language === 'vi' ? 'Đăng nhập' : 'Login'}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-premium-green hover:bg-premium-green/85 rounded-xl transition shadow-glow"
                >
                  {language === 'vi' ? 'Đăng ký miễn phí' : 'Sign up free'}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Language Switcher Mobile */}
            <button
              onClick={toggleLanguage}
              className="p-2 bg-premium-border/30 text-gray-300 rounded-xl border border-premium-border/30 text-xs font-black flex items-center gap-1"
            >
              {language === 'vi' ? 'VI' : 'EN'}
            </button>
            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 bg-premium-border/30 text-gray-300 rounded-xl border border-premium-border/30 flex items-center justify-center"
              title="Đổi giao diện / Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-400 hover:text-white rounded-lg focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && user && (
          <div className="md:hidden absolute top-full left-0 right-0 border-b border-premium-border/50 bg-premium-dark/95 backdrop-blur-lg px-6 py-4 flex flex-col gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition ${
                    isLinkActive(item.path)
                      ? 'bg-premium-green text-white'
                      : 'text-gray-400 hover:text-white hover:bg-premium-border/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            <hr className="border-premium-border/30 my-1" />
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{user.full_name}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-premium-rose/10 hover:bg-premium-rose/20 text-premium-rose rounded-lg text-sm font-bold transition"
              >
                <LogOut className="w-4 h-4" />
                Thoát
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Tab Bar (iOS Style - Dành cho Mobile Browser) */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-premium-dark/90 backdrop-blur-lg border-t border-premium-border/40 py-2.5 px-6 flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`p-2 rounded-xl transition ${
                    active ? 'bg-premium-green text-white shadow-glow' : 'text-gray-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold ${active ? 'text-premium-green' : 'text-gray-500'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
};
export default Navbar;
