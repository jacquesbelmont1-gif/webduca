import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/auth';

export function Layout() {
  const user = useAuthStore((state) => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#051524] flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar userName={user?.name || ''} monthlyAmount={0.00} />
      </div>
      
      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#112840] text-white hover:bg-[#1079e2] transition-colors"
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile menu overlay */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Mobile sidebar */}
        <div
          className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar 
            userName={user?.name || ''} 
            monthlyAmount={0.00} 
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />
        </div>
      </div>
      
      <main className="flex-1 w-full overflow-auto pb-20 lg:pb-0 pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}