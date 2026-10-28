import React from 'react';
import { Shield } from 'lucide-react';
import { isImageUrl } from '../utils/imageUtils';

interface GuildBadgeProps {
  badge?: string | null;
  name?: string;
  className?: string;
  sizeClassName?: string;
}

export const GuildBadge: React.FC<GuildBadgeProps> = ({
  badge,
  name,
  className = '',
  sizeClassName = 'w-10 h-10',
}) => {
  const isImage = isImageUrl(badge);

  if (isImage && badge) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-cyan-400/50 bg-slate-950 shrink-0 ${sizeClassName} ${className}`}>
        <img
          src={badge}
          alt={name ? `Emblème de ${name}` : 'Emblème de guilde'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shrink-0 select-none ${sizeClassName} ${className}`}>
      {badge ? <span>{badge}</span> : <Shield className="w-5 h-5 text-cyan-400" />}
    </div>
  );
};
