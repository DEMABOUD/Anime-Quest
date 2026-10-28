import React, { useState } from 'react';
import { signInWithPopup, auth, googleProvider } from '../firebase';
import { Sparkles, Shield, Swords, Users, Loader2 } from 'lucide-react';

interface AuthModalProps {
  onSuccess: (user: any) => void;
  onGuestMode?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onGuestMode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onSuccess(result.user);
    } catch (err: any) {
      console.error('Google Auth error:', err);
      // Helpful fallback message if popup blocked or network issue
      if (err.code === 'auth/popup-blocked') {
        setError('Le bloqueur de fenêtres a empêché la connexion. Veuillez autoriser les popups.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Connexion annulée.');
      } else {
        setError(err.message || 'Impossible de se connecter avec Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#070b19] relative overflow-hidden">
      {/* Background Anime Ambience & Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0b1329]/90 border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 text-center">
        
        {/* Warrior Icon / Crest */}
        <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 shadow-lg shadow-cyan-500/20">
          <div className="text-4xl">⚔️</div>
          <div className="absolute -inset-1 rounded-2xl bg-cyan-400/20 blur-md -z-10" />
        </div>

        {/* Title & Branding */}
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
          ANIME QUEST
        </h1>
        <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mt-1 mb-3">
          Quiz • Duels • Guildes • Communauté
        </p>

        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          Rejoins la plus grande communauté d’anime et de manga ! Crée ton profil, affronte d'autres joueurs et hisse ta guilde au sommet mondial.
        </p>

        {/* Highlights */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <Swords className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-200">Duels 1v1</div>
            <div className="text-[9px] text-slate-400">Temps réel</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <Shield className="w-4 h-4 text-violet-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-200">Guildes</div>
            <div className="text-[9px] text-slate-400">Guerres 20 Q</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <Users className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-200">Social</div>
            <div className="text-[9px] text-slate-400">Amis & Chat</div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs text-left">
            {error}
          </div>
        )}

        {/* Google Login Button (Required per specifications) */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold font-sans text-sm shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer group hover:scale-[1.02] active:scale-[0.99]"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
          ) : (
            <>
              {/* Google SVG Logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Se connecter avec Google</span>
            </>
          )}
        </button>

        {onGuestMode && (
          <button
            onClick={onGuestMode}
            type="button"
            className="mt-3 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 font-medium text-xs transition-colors cursor-pointer"
          >
            Mode Invité / Essai rapide
          </button>
        )}

        <p className="mt-5 text-[11px] text-slate-500 leading-tight">
          En continuant, vous acceptez les Conditions d’utilisation et la Politique de confidentialité d'Anime Quest.
        </p>
      </div>
    </div>
  );
};
