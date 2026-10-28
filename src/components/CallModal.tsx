import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX, Shield, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface CallModalProps {
  currentUser: UserProfile;
  targetUser?: { uid: string; displayName: string; photoURL: string } | null;
  isOpen: boolean;
  onEndCall: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  currentUser,
  targetUser,
  isOpen,
  onEndCall,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Request actual camera & microphone permissions
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function startMedia() {
      try {
        setPermissionError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.warn('Media devices access note:', err.message);
        setPermissionError('Caméra ou micro non accessible. Mode avatar activé.');
        setIsCameraOn(false);
      }
    }

    startMedia();

    // Call duration timer
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  // Toggle Mute
  const toggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted; // Invert
      });
    }
    setIsMuted(!isMuted);
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !isCameraOn;
      });
    }
    setIsCameraOn(!isCameraOn);
  };

  if (!isOpen) return null;

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const partnerName = targetUser?.displayName || 'ZoroLegend';
  const partnerPhoto = targetUser?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=Zoro';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#090e1d] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Call Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-200">
              Appel en direct • {timeFormatted}
            </span>
          </div>
          <div className="text-[11px] font-mono text-cyan-400">
            Connexion P2P Sécurisée
          </div>
        </div>

        {permissionError && (
          <div className="m-3 p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{permissionError}</span>
          </div>
        )}

        {/* Video Grid (Mockup 9) */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[320px]">
          {/* Tile 1: Current User (Real video stream or avatar) */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center min-h-[160px] sm:min-h-[220px]">
            {isCameraOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center">
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-cyan-400 shadow-lg mb-2"
                />
                <span className="text-xs font-bold text-slate-300">Caméra désactivée</span>
              </div>
            )}
            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-slate-800 text-[11px] font-bold text-white flex items-center gap-1.5">
              <span>{currentUser.displayName} (Vous)</span>
              {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
            </div>
          </div>

          {/* Tile 2: Partner / Friend */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center min-h-[160px] sm:min-h-[220px]">
            <div className="flex flex-col items-center">
              <img
                src={partnerPhoto}
                alt={partnerName}
                className="w-20 h-20 rounded-full object-cover border-2 border-violet-400 shadow-lg mb-2"
              />
              <span className="text-xs font-bold text-slate-300">{partnerName}</span>
              <span className="text-[10px] text-emerald-400">Audio actif</span>
            </div>
            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-slate-800 text-[11px] font-bold text-white">
              <span>{partnerName}</span>
            </div>
          </div>
        </div>

        {/* Call Controls Bar (Mockup 9) */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-center gap-4">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full border transition-colors cursor-pointer ${
              isMuted ? 'bg-red-950/80 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Activer le micro' : 'Couper le micro'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Speaker toggle */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-3 rounded-full border transition-colors cursor-pointer ${
              !isSpeakerOn ? 'bg-red-950/80 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
            title={isSpeakerOn ? 'Désactiver le son' : 'Activer le son'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Camera toggle */}
          <button
            onClick={toggleCamera}
            className={`p-3 rounded-full border transition-colors cursor-pointer ${
              !isCameraOn ? 'bg-red-950/80 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
            title={isCameraOn ? 'Désactiver la vidéo' : 'Activer la vidéo'}
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Hang up red button (Mockup 9) */}
          <button
            onClick={onEndCall}
            className="p-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/60 transition-transform hover:scale-105 cursor-pointer"
            title="Terminer l'appel"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
