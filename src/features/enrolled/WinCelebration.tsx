import React, { useEffect, useState } from 'react';
import type { Enrollment } from '../../shared/types';

interface WinCelebrationProps {
  enrollment: Enrollment;
  onClose: () => void;
}

interface Particle {
  id: number;
  x: number;
  color: string;
  duration: number;
  delay: number;
  size: number;
  emoji: string;
}

const EMOJIS = ['🎉', '🎊', '⭐', '🏆', '🎯', '💫', '✨', '🎈'];
const COLORS = ['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'];

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export const WinCelebration: React.FC<WinCelebrationProps> = ({ enrollment, onClose }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 1.5,
      size: 14 + Math.floor(Math.random() * 16),
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute animate-confetti"
            style={{
              left: `${p.x}%`,
              top: '-20px',
              fontSize: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* Card */}
      <div
        className="bg-gradient-to-br from-yellow-900 via-amber-900 to-orange-900 border-2 border-yellow-600 rounded-3xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-yellow-300 text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          Deal Thành Công!
        </h1>
        <p className="text-amber-200 text-sm mb-6">Chúc mừng bạn đã chốt được deal mới!</p>

        <div className="bg-black/30 rounded-2xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-amber-400 text-sm">Học viên</span>
            <span className="text-white text-sm font-medium">{enrollment.primary_consultant.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-400 text-sm">Chương trình</span>
            <span className="text-white text-sm font-medium">{enrollment.program.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-400 text-sm">Doanh thu</span>
            <span className="text-yellow-300 text-lg font-bold">{formatVND(enrollment.amount_paid)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-400 text-sm">Thanh toán</span>
            <span className="text-white text-sm">{enrollment.payment_method.label}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 rounded-xl transition-colors w-full"
        >
          🎊 Tuyệt vời!
        </button>
      </div>
    </div>
  );
};
