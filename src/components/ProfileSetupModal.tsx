import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { checkUsernameAvailable, createUserProfile, updateUserProfile } from '../services/userService';
import { UserProfile } from '../types';

interface ProfileSetupModalProps {
  uid: string;
  initialProfile?: UserProfile | null;
  isOpen: boolean;
  onSuccess: (profile: UserProfile) => void;
  onClose?: () => void;
  isEditMode?: boolean;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  uid,
  initialProfile,
  isOpen,
  onSuccess,
  onClose,
  isEditMode = false,
}) => {
  const [displayName, setDisplayName] = useState(initialProfile?.displayName || '');
  const [username, setUsername] = useState(initialProfile?.username || '');
  const [bio, setBio] = useState(initialProfile?.bio || '');
  const [photoURL, setPhotoURL] = useState(initialProfile?.photoURL || '');
  
  // Username check states
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');
  
  // Loading & error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialProfile) {
      setDisplayName(initialProfile.displayName);
      setUsername(initialProfile.username);
      setBio(initialProfile.bio);
      setPhotoURL(initialProfile.photoURL);
    }
  }, [initialProfile]);

  // Debounced check for username uniqueness
  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean || clean.length < 3) {
      setUsernameStatus('invalid');
      return;
    }

    if (isEditMode && initialProfile && clean === initialProfile.username.toLowerCase()) {
      setUsernameStatus('available');
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const available = await checkUsernameAvailable(clean);
        setUsernameStatus(available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('invalid');
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, isEditMode, initialProfile]);

  // Gallery file picker & compression
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Veuillez sélectionner un fichier image valide depuis votre galerie.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress using off-screen canvas to max 400x400 for persistent Firestore storage
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 350;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoURL(compressedDataUrl);
          setErrorMsg(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!displayName.trim() || displayName.trim().length < 2) {
      setErrorMsg('Le pseudo doit comporter au moins 2 caractères.');
      return;
    }

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || cleanUser.length < 3 || cleanUser.length > 30) {
      setErrorMsg('Le nom d’utilisateur doit comporter entre 3 et 30 caractères.');
      return;
    }

    if (usernameStatus !== 'available') {
      setErrorMsg('Ce nom d’utilisateur n’est pas disponible.');
      return;
    }

    if (!photoURL) {
      setErrorMsg('Veuillez sélectionner une photo de profil depuis la galerie de votre appareil.');
      return;
    }

    if (!bio.trim()) {
      setErrorMsg('Veuillez renseigner une courte biographie.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && initialProfile) {
        await updateUserProfile(
          uid,
          {
            displayName: displayName.trim(),
            username: cleanUser,
            photoURL,
            bio: bio.trim(),
          },
          initialProfile.username
        );
        onSuccess({
          ...initialProfile,
          displayName: displayName.trim(),
          username: cleanUser,
          photoURL,
          bio: bio.trim(),
        });
      } else {
        const created = await createUserProfile({
          uid,
          displayName: displayName.trim(),
          username: cleanUser,
          photoURL,
          bio: bio.trim(),
        });
        onSuccess(created);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue lors de l’enregistrement de votre profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-[#0b1329] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 text-slate-100 my-8">
        
        {/* Glow accent */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {isEditMode ? 'Modification du Profil' : 'Création Obligatoire du Profil'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-wide">
            {isEditMode ? 'Modifier votre Identité' : 'Bienvenue sur Anime Quest'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {isEditMode 
              ? 'Mettez à jour vos informations publiques de jeu.'
              : 'Complétez les 4 éléments obligatoires pour accéder au jeu et à la communauté.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start gap-2.5 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Photo de profil depuis la galerie */}
          <div className="flex flex-col items-center">
            <label className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-2">
              Photo de profil (Galerie du téléphone) *
            </label>
            <div className="relative group cursor-pointer">
              <div className="w-28 h-28 rounded-full border-2 border-cyan-500/60 overflow-hidden bg-slate-900 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
                {photoURL ? (
                  <img src={photoURL} alt="Aperçu profil" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-slate-500 group-hover:text-cyan-400 transition-colors p-2 text-center">
                    <Camera className="w-8 h-8 mb-1" />
                    <span className="text-[10px] leading-tight">Choisir depuis la galerie</span>
                  </div>
                )}
              </div>
              <label 
                htmlFor="gallery-input"
                className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold text-white"
              >
                Parcourir
              </label>
              <input
                id="gallery-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 text-center">
              Touchez le cercle pour sélectionner une photo de votre galerie.
            </p>
          </div>

          {/* 2. Pseudo (Nom affiché) */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-1.5">
              A. Pseudo (Nom affiché dans le jeu) *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ex : Luffy_976, ZoroLeBreteur..."
              maxLength={50}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-white text-sm placeholder:text-slate-500 transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Visible dans les quiz, les groupes et les guildes. Peut être modifié ultérieurement.
            </p>
          </div>

          {/* 3. Nom d'utilisateur (Unique) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase font-bold tracking-wider text-slate-300">
                B. Nom d’utilisateur (Identifiant unique) *
              </label>
              <div className="flex items-center gap-1 text-xs">
                {isCheckingUsername && (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    Vérification...
                  </span>
                )}
                {!isCheckingUsername && usernameStatus === 'available' && (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Disponible
                  </span>
                )}
                {!isCheckingUsername && usernameStatus === 'taken' && (
                  <span className="text-red-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Déjà pris
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 font-mono font-bold text-sm">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="nom_unique"
                maxLength={30}
                required
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-white font-mono text-sm placeholder:text-slate-500 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Sert à vous rechercher et à vous ajouter en ami. Unique sur l’ensemble du serveur.
            </p>
          </div>

          {/* 4. Biographie */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-1.5">
              C. Biographie *
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ex : Passionné de Shōnen et de One Piece ! Prêt pour tous les duels..."
              rows={3}
              maxLength={500}
              required
              className="w-full px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-white text-sm placeholder:text-slate-500 transition-all resize-none"
            />
            <div className="flex justify-end text-[11px] text-slate-400">
              {bio.length} / 500
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            {isEditMode && onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium text-sm transition-colors"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || usernameStatus !== 'available' || !photoURL}
              className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-display uppercase tracking-wider text-sm shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  Enregistrement sur le serveur...
                </>
              ) : (
                isEditMode ? 'Sauvegarder les modifications' : 'Entrer dans Anime Quest'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
