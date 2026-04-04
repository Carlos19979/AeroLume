'use client';

import { type LucideIcon } from 'lucide-react';
import { AnimatedNumber, ScaleOnHover } from './animations';

const GRADIENTS: Record<string, string> = {
  blue: 'from-white to-blue-50/60',
  green: 'from-white to-emerald-50/60',
  purple: 'from-white to-violet-50/60',
  amber: 'from-white to-amber-50/60',
  rose: 'from-white to-rose-50/60',
};

const ICON_BG: Record<string, string> = {
  blue: 'bg-blue-100/60 text-blue-600',
  green: 'bg-emerald-100/60 text-emerald-600',
  purple: 'bg-violet-100/60 text-violet-600',
  amber: 'bg-amber-100/60 text-amber-600',
  rose: 'bg-rose-100/60 text-rose-600',
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  href,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: string;
  href?: string;
}) {
  const content = (
    <div className={`rounded-2xl p-6 bg-gradient-to-br ${GRADIENTS[color] || GRADIENTS.blue} shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-3xl font-bold text-gray-900">
            <AnimatedNumber value={value} />
          </div>
          <p className="text-sm text-gray-500 mt-1">{title}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ICON_BG[color] || ICON_BG.blue}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <ScaleOnHover>
        <a href={href}>{content}</a>
      </ScaleOnHover>
    );
  }

  return <ScaleOnHover>{content}</ScaleOnHover>;
}
