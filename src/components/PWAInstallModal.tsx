import React, { useState } from 'react';
import { Download, X, Smartphone, Check, Share2, Sparkles, ShieldCheck, Maximize2, Globe, QrCode, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getPublicAppUrl, PUBLIC_APP_URL } from '../utils/appUrl';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, enterFullscreen } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop' | 'qr'>('android');
  const [installSuccess, setInstallSuccess] = useState(false);
  const [showGuideNotice, setShowGuideNotice] = useState(false);

  if (!isOpen) return null;

  const publicAppUrl = getPublicAppUrl();

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(publicAppUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Anime Quest',
          text: 'Rejoins Anime Quest sur ton téléphone ! Quiz anime, duels en direct et guildes.',
          url: publicAppUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDirectInstall = async () => {
    try {
      if (isInstallable) {
        const success = await install();
        if (success) {
          setInstallSuccess(true);
          setTimeout(() => {
            onClose();
          }, 1500);
          return;
        }
      }

      // If the browser does not allow programmatic install prompt (e.g. inside an embedded frame),
      // we cleanly direct the user to the native Chrome menu without opening any forbidden 403 URLs!
      setShowGuideNotice(true);
      setActiveTab('android');
    } catch (err) {
      console.warn('Install handler notice:', err);
      setShowGuideNotice(true);
    }
  };

  const handleFullscreenMode = async () => {
    await enterFullscreen();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0b1329] border border-cyan-500/40 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div className="text-center mb-6">
          <div className="relative w-20 h-20 mx-auto mb-3 rounded-2xl p-1 bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-xl shadow-cyan-500/30">
            <img
              src="/icon.svg"
              alt="Anime Quest Logo"
              className="w-full h-full rounded-xl object-cover bg-[#070b19]"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Application Officielle • Accès Réservé
          </div>

          <h2 className="text-2xl font-bold font-display text-white">
            Installer Anime Quest
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Installez et ouvrez directement l'application sur votre appareil sans barre d'adresse avec toutes les fonctionnalités.
          </p>
        </div>

        {/* Success Banner if just installed */}
        {installSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Installation acceptée ! L'application est ajoutée à votre écran d'accueil.</span>
          </div>
        )}

        {/* Main Action Block */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-b from-cyan-950/70 to-slate-900 border border-cyan-500/50 text-center space-y-3 shadow-lg shadow-cyan-950/50">
          <div className="flex items-center justify-center gap-2 text-xs text-cyan-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Application Progressive Web App (PWA)</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleDirectInstall}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black font-display uppercase tracking-wider text-xs sm:text-sm shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>{isInstallable ? "Installer l'application maintenant" : "Ajouter à l'écran d'accueil"}</span>
            </button>

            <button
              onClick={handleFullscreenMode}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Passer en Mode Plein Écran Immersion</span>
            </button>
          </div>

          {showGuideNotice && (
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-[11px] text-cyan-200 text-left">
              💡 <strong>Astuce rapide :</strong> Pour installer Anime Quest directement sur Android, appuyez sur le bouton <strong>⋮ (3 points en haut à droite de Chrome)</strong> puis sur <strong>« Installer l'application »</strong> !
            </div>
          )}
        </div>

        {/* Device Switcher Tabs */}
        <div className="grid grid-cols-4 p-1 rounded-2xl bg-slate-900 border border-slate-800 mb-4 gap-1">
          <button
            onClick={() => setActiveTab('android')}
            className={`py-2 rounded-xl text-[11px] font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Android
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`py-2 rounded-xl text-[11px] font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            iPhone
          </button>
          <button
            onClick={() => setActiveTab('desktop')}
            className={`py-2 rounded-xl text-[11px] font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PC / Mac
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2 rounded-xl text-[11px] font-bold font-display uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'qr'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code</span>
          </button>
        </div>

        {/* Instructions by Device */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs text-slate-300">
          {activeTab === 'android' && (
            <div className="space-y-2.5">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Smartphone className="w-4 h-4" />
                <span>Guide d'installation Android (Google Chrome) :</span>
              </div>
              <ol className="space-y-2 list-decimal list-inside text-slate-300 text-xs">
                <li>Ouvrez l'<strong>URL publique</strong> (indiquée ci-dessous) dans Google Chrome.</li>
                <li>Appuyez sur le menu (les <strong>3 petits points verticaux ⋮</strong> en haut à droite).</li>
                <li>Appuyez sur <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.</li>
                <li>Confirmez en appuyant sur <strong>Installer</strong>.</li>
                <li>L'application Anime Quest apparaîtra instantanément sur votre écran d'accueil !</li>
              </ol>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-2.5">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Smartphone className="w-4 h-4" />
                <span>Installation sur iPhone / iPad (Safari) :</span>
              </div>
              <ol className="space-y-2 list-decimal list-inside text-slate-300 text-xs">
                <li>Ouvrez l'URL publique dans <strong>Safari</strong>.</li>
                <li>Appuyez sur le bouton de <strong>Partage</strong> (le carré avec la flèche vers le haut ⬆ en bas).</li>
                <li>Faites défiler vers le bas et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.</li>
                <li>Appuyez sur <strong>Ajouter</strong> en haut à droite.</li>
              </ol>
            </div>
          )}

          {activeTab === 'desktop' && (
            <div className="space-y-2.5">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <span>Installation sur Ordinateur (Chrome / Edge) :</span>
              </div>
              <ol className="space-y-2 list-decimal list-inside text-slate-300 text-xs">
                <li>Dans la barre d'adresse en haut à droite, cliquez sur l'icône <strong>Installer (🖥️ ou ⬇️)</strong>.</li>
                <li>Cliquez sur <strong>Installer</strong> pour lancer l'application en fenêtre indépendante.</li>
              </ol>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center text-center space-y-3 py-1">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <QrCode className="w-4 h-4" />
                <span>Scannez avec l'appareil photo de votre smartphone :</span>
              </div>
              <div className="p-2.5 bg-white rounded-2xl shadow-xl shadow-cyan-500/20 inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(publicAppUrl)}`}
                  alt="QR Code Anime Quest"
                  className="w-40 h-40 block rounded-lg"
                  loading="lazy"
                />
              </div>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Pointez l'appareil photo de votre téléphone vers ce QR code pour ouvrir directement Anime Quest sur mobile et l'installer !
              </p>
            </div>
          )}
        </div>

        {/* Public Accessible URL & Share */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-2.5 shadow-lg shadow-cyan-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>URL Publique Officielle (Sans erreur 403) :</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] text-emerald-300 font-semibold">
              Accessible Partout
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-cyan-400 font-mono break-all select-all">
            {publicAppUrl}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleShare}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Partager</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-cyan-500/20"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                  <span>Lien Copié !</span>
                </>
              ) : (
                <span>Copier le Lien Public</span>
              )}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold cursor-pointer transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};
