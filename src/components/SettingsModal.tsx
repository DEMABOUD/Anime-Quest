import React, { useState } from 'react';
import { 
  X, 
  User, 
  Bell, 
  Lock, 
  Volume2, 
  Globe, 
  HelpCircle, 
  Info, 
  LogOut, 
  Check, 
  Camera, 
  Mic,
  Download,
  Crown 
} from 'lucide-react';
import { UserProfile } from '../types';
import { signOut, auth } from '../firebase';

interface SettingsModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  isAdmin?: boolean;
  onClose: () => void;
  onLogout: () => void;
  onEditProfile: () => void;
  onOpenInstallModal?: () => void;
  onOpenAdminPanel?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  isOpen,
  isAdmin = false,
  onClose,
  onLogout,
  onEditProfile,
  onOpenInstallModal,
  onOpenAdminPanel,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [mediaTestStatus, setMediaTestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach(t => t.stop());
      setMediaTestStatus('Microphone et Caméra fonctionnels !');
    } catch {
      setMediaTestStatus('Autorisation refusée ou équipement non détecté.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onLogout();
      onClose();
    } catch (err) {
      console.error('Erreur déconnexion:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#0b1329] border border-cyan-500/30 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-display text-white">Paramètres</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card - Confidential (No Google name or email displayed) */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName}
              className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400"
            />
            <div>
              <div className="text-sm font-bold font-display text-white">{currentUser.displayName}</div>
              <div className="text-[11px] text-cyan-400 font-mono">@{currentUser.username}</div>
              <div className="text-[10px] text-amber-300 font-display font-medium">
                {currentUser.rankTitle} • Niv. {currentUser.level}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onEditProfile();
            }}
            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer"
          >
            Éditer
          </button>
        </div>

        {/* Menu list */}
        <div className="space-y-2 text-xs">
          {/* Notifications */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-200 font-medium">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>Notifications de duels et messages</span>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                notificationsEnabled ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                notificationsEnabled ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Sound & Audio */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-200 font-medium">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Effets sonores des quiz</span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                soundEnabled ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Audio & Video hardware test */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-slate-200 font-medium">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Tester micro et caméra</span>
              </div>
              <button
                onClick={handleTestMedia}
                className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-semibold text-[11px] cursor-pointer"
              >
                Tester
              </button>
            </div>
            {mediaTestStatus && (
              <p className="text-[11px] text-cyan-300 font-mono italic">
                {mediaTestStatus}
              </p>
            )}
          </div>

          {/* Télécharger / Installer l'Application */}
          {onOpenInstallModal && (
            <div 
              onClick={() => {
                onClose();
                onOpenInstallModal();
              }}
              className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/50 flex items-center justify-between cursor-pointer hover:border-cyan-400 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2.5 text-cyan-200 font-bold">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Télécharger l'Application (Android / iOS)</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-400 text-slate-950 uppercase">
                Installer
              </span>
            </div>
          )}

          {/* Panneau Administrateur (Master & Délégués) */}
          {isAdmin && onOpenAdminPanel && (
            <div 
              onClick={() => {
                onClose();
                onOpenAdminPanel();
              }}
              className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-yellow-950/60 border border-amber-500/60 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2.5 text-amber-200 font-bold">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Panneau Administrateur Suprême</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase">
                Admin
              </span>
            </div>
          )}

          {/* Language */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-200 font-medium">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Langue</span>
            </div>
            <span className="font-semibold text-cyan-400">Français</span>
          </div>

          {/* Version & About */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-slate-400" />
              <span>Anime Quest v1.0.0</span>
            </div>
            <span className="text-[10px] font-mono">Firestore Connected</span>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="pt-5">
          <button
            onClick={handleSignOut}
            className="w-full py-3 rounded-xl bg-red-950/40 border border-red-500/50 hover:bg-red-900/40 text-red-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
