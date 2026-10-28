import React, { useState, useRef } from 'react';
import { Users, X, Loader2, Sparkles, Lock, Globe, Camera, Image as ImageIcon } from 'lucide-react';
import { UserProfile, GroupChat } from '../types';
import { createGroup } from '../services/socialService';
import { compressImageFromFile } from '../utils/imageUtils';

interface CreateGroupModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (newGroup: GroupChat) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onGroupCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Anime Général');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleEmblemSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setError(null);
    try {
      const compressedData = await compressImageFromFile(file, 350, 0.85);
      setAvatarUrl(compressedData);
    } catch (err: any) {
      setError(err.message || 'Impossible de charger cette image.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Veuillez donner un nom à votre groupe.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createGroup(
        name.trim(),
        description.trim(),
        category,
        isPrivate,
        currentUser,
        avatarUrl
      );
      onGroupCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du groupe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#0b1329] border border-cyan-500/30 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold font-display text-white">Créer un Groupe</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Custom Emblem Selection from Gallery */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-2">
              Emblème personnalisé du groupe (depuis votre galerie)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleEmblemSelect}
              className="hidden"
            />
            
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-16 h-16 rounded-2xl bg-slate-950 border-2 border-cyan-400/60 overflow-hidden flex items-center justify-center cursor-pointer group shrink-0 shadow-md"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Emblème sélectionné"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-cyan-300 transition-colors">
                    <ImageIcon className="w-6 h-6 mb-0.5" />
                    <span className="text-[9px] uppercase font-bold">Galerie</span>
                  </div>
                )}
                
                {isProcessingImage && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/50 hover:bg-cyan-900/60 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{avatarUrl ? 'Changer l’image' : 'Choisir dans la galerie'}</span>
                </button>
                <p className="text-[11px] text-slate-400 mt-1">
                  Format photo standard de votre téléphone (JPEG, PNG).
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-1">
              Nom du groupe *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Fans de One Piece, Guilde des Ombres..."
              maxLength={60}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 outline-none text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex : Un groupe pour tous les passionnés de manga ! On partage, on discute et on s'entraide !"
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 outline-none text-white text-xs resize-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-1">
              Catégorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
            >
              <option value="Anime Général">Anime Général</option>
              <option value="One Piece">One Piece</option>
              <option value="Naruto">Naruto</option>
              <option value="Dragon Ball">Dragon Ball</option>
              <option value="Jujutsu Kaisen">Jujutsu Kaisen</option>
              <option value="Solo Leveling">Solo Leveling</option>
              <option value="Bleach">Bleach</option>
              <option value="L’Attaque des Titans">L’Attaque des Titans</option>
              <option value="Demon Slayer">Demon Slayer</option>
              <option value="Stratégie & Quiz">Stratégie & Quiz</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-1">
              Confidentialité
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer ${
                  !isPrivate ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Groupe Public</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer ${
                  isPrivate ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Groupe Privé</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-display uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  Création en cours...
                </>
              ) : (
                'Créer le groupe'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
