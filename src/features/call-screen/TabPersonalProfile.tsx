import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lead, PersonalProfile } from '../../shared/types';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

async function fetchPersonalProfile(leadId: string): Promise<PersonalProfile | null> {
  const res = await fetch(`/api/leads/${leadId}/personal-profile`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch profile');
  const json = await res.json();
  return json.data;
}

async function generatePersonalProfile(leadId: string): Promise<PersonalProfile> {
  const res = await fetch(`/api/leads/${leadId}/personal-profile/generate`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to generate profile');
  const json = await res.json();
  return json.data;
}

interface TabPersonalProfileProps {
  lead: Lead;
}

export const TabPersonalProfile: React.FC<TabPersonalProfileProps> = ({ lead }) => {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['personal-profile', lead.id],
    queryFn: () => fetchPersonalProfile(lead.id),
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: () => generatePersonalProfile(lead.id),
    onMutate: () => setGenerating(true),
    onSuccess: (data) => {
      queryClient.setQueryData(['personal-profile', lead.id], data);
      setGenerating(false);
    },
    onError: () => setGenerating(false),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <LoadingSpinner text="Đang tải..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">🌟</div>
          <h3 className="text-white font-semibold mb-2">Chưa có Personal Profile</h3>
          <p className="text-slate-400 text-sm mb-4">
            Phân tích chuyên sâu dựa trên BaZi, Numerology & Nine Star Ki
          </p>

          {generating ? (
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner />
              <p className="text-indigo-300 text-sm animate-pulse">Đang tổng hợp... BaZi · Numerology · Nine Star Ki</p>
            </div>
          ) : (
            <button
              onClick={() => generateMutation.mutate()}
              disabled={!lead.person.date_of_birth}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              ✨ Tạo Personal Profile
            </button>
          )}

          {!lead.person.date_of_birth && (
            <p className="text-amber-400 text-xs mt-3">⚠️ Cần ngày sinh để tạo profile</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto h-full space-y-4">
      {/* Hero card */}
      <div className="bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-900 border border-indigo-800/50 rounded-2xl p-4">
        <p className="text-indigo-200 text-sm italic leading-relaxed mb-4">"{profile.hero_card.quote}"</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-violet-400 text-xs mb-0.5">Nhật chủ</div>
            <div className="text-white text-sm font-bold">{profile.hero_card.nhat_chu}</div>
          </div>
          <div className="text-center">
            <div className="text-violet-400 text-xs mb-0.5">Life Path</div>
            <div className="text-white text-2xl font-bold">{profile.hero_card.life_path}</div>
          </div>
          <div className="text-center">
            <div className="text-violet-400 text-xs mb-0.5">Nine Star</div>
            <div className="text-white text-xs font-bold leading-tight">{profile.hero_card.nine_star}</div>
          </div>
        </div>
      </div>

      {/* Core personality */}
      {profile.core_personality_summary && (
        <div>
          <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Tính cách cốt lõi</h4>
          <p className="text-slate-200 text-sm leading-relaxed">{profile.core_personality_summary}</p>
        </div>
      )}

      {/* Dos & Don'ts */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-3">
          <h4 className="text-emerald-400 text-xs font-semibold mb-2">✅ Nên làm</h4>
          <ul className="space-y-1">
            {profile.communication_dos.map((item, i) => (
              <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>{item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-3">
          <h4 className="text-red-400 text-xs font-semibold mb-2">❌ Tránh làm</h4>
          <ul className="space-y-1">
            {profile.communication_donts.map((item, i) => (
              <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>{item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* True needs */}
      {profile.true_needs && (
        <div>
          <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Nhu cầu thực sự</h4>
          <p className="text-slate-200 text-sm">{profile.true_needs}</p>
        </div>
      )}

      {/* 2026 timing */}
      {profile.current_year_timing && (
        <div>
          <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Vận 2026</h4>
          <p className="text-slate-200 text-sm">{profile.current_year_timing}</p>
        </div>
      )}

      {/* Opening suggestion */}
      {profile.opening_suggestion && (
        <div className="border-2 border-yellow-600/60 bg-yellow-950/30 rounded-xl p-4">
          <h4 className="text-yellow-400 text-xs font-semibold mb-2">💬 Gợi ý mở đầu</h4>
          <p className="text-yellow-100 text-sm italic leading-relaxed">{profile.opening_suggestion}</p>
        </div>
      )}

      <div className="text-slate-600 text-xs text-right">
        Tổng hợp lúc {new Date(profile.generated_at).toLocaleString('vi-VN')}
      </div>
    </div>
  );
};
