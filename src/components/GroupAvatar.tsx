import React from 'react';
import { Users } from 'lucide-react';
import { isImageUrl } from '../utils/imageUtils';

interface GroupAvatarProps {
  avatarUrl?: string | null;
  name?: string;
  category?: string;
  className?: string;
  sizeClassName?: string;
}

export const GroupAvatar: React.FC<GroupAvatarProps> = ({
  avatarUrl,
  name,
  category,
  className = '',
  sizeClassName = 'w-11 h-11',
}) => {
  const isImage = isImageUrl(avatarUrl);

  if (isImage && avatarUrl) {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-cyan-400/50 bg-slate-950 shrink-0 ${sizeClassName} ${className}`}>
        <img
          src={avatarUrl}
          alt={name ? `Emblème de ${name}` : 'Emblème de groupe'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback initial or stylized badge
  const initial = name?.trim().charAt(0).toUpperCase() || 'G';

  return (
    <div className={`rounded-2xl bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-500/30 flex items-center justify-center font-display font-bold text-cyan-300 shrink-0 shadow-sm ${sizeClassName} ${className}`}>
      {name ? (
        <span className="text-base">{initial}</span>
      ) : (
        <Users className="w-5 h-5 text-cyan-400" />
      )}
    </div>
  );
};
