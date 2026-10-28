import React, { useState, useEffect } from 'react';
import { 
  X, 
  Crown, 
  Users, 
  Eye, 
  ShieldCheck, 
  UserPlus, 
  UserMinus, 
  Search, 
  Trophy, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Loader2, 
  Flame, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Globe,
  Copy,
  ExternalLink
} from 'lucide-react';
import { UserProfile, AdminRecord } from '../types';
import { 
  getAllUsersForAdmin, 
  getAllAdmins, 
  grantAdminPrivilege, 
  revokeAdminPrivilege, 
  isMasterAdminEmail 
} from '../services/adminService';
import { auth } from '../firebase';
import { getPublicAppUrl, PUBLIC_APP_URL } from '../utils/appUrl';

interface AdminPanelModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  oracleEnabled: boolean;
  onToggleOracle: (enabled: boolean) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  oracleEnabled,
  onToggleOracle,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'oracle' | 'admins'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const currentAuthEmail = auth.currentUser?.email;
  const isMaster = isMasterAdminEmail(currentAuthEmail);
  const publicAppUrl = getPublicAppUrl();

  const handleCopyPublicUrl = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(publicAppUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const [allUsers, allAdmins] = await Promise.all([
        getAllUsersForAdmin(),
        getAllAdmins(),
      ]);
      setUsers(allUsers);
      setAdmins(allAdmins);
    } catch (err: any) {
      setStatusMessage({ text: 'Erreur lors du chargement des données administrateur.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter users strictly by pseudo or username (strictly preserving Google account confidentiality)
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.rankTitle && u.rankTitle.toLowerCase().includes(q))
    );
  });

  const handleGrantAdmin = async (targetUser: UserProfile) => {
    setActionLoading(targetUser.uid);
    setStatusMessage(null);
    try {
      await grantAdminPrivilege(targetUser, currentUser.uid);
      setStatusMessage({ 
        text: `Privilèges administrateur suprêmes accordés à ${targetUser.displayName} (@${targetUser.username}) !`, 
        type: 'success' 
      });
      await loadData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Échec de l’attribution des droits.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeAdmin = async (targetUid: string, targetName: string) => {
    setActionLoading(targetUid);
    setStatusMessage(null);
    try {
      await revokeAdminPrivilege(targetUid);
      setStatusMessage({ 
        text: `Droits administrateur révoqués pour ${targetName}.`, 
        type: 'success' 
      });
      await loadData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Échec de la révocation.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const isUserAdmin = (uid: string) => {
    return admins.some((a) => a.uid === uid);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col rounded-3xl bg-[#080d1e] border border-amber-500/50 shadow-2xl shadow-amber-950/40 overflow-hidden relative">
        
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-20 bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-amber-500/30 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display text-white tracking-wide">
                  Panneau Administrateur Suprême
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-400 text-amber-300 font-mono text-[10px] font-bold">
                  {isMaster ? 'MAÎTRE RACINE' : 'ADMIN DÉLÉGUÉ'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Gestion des utilisateurs, révélation automatique des quiz & délégation des priorités
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className={`px-4 py-2.5 flex items-center gap-2 text-xs font-medium ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-950/90 text-emerald-300 border-b border-emerald-500/40' 
              : 'bg-red-950/90 text-red-300 border-b border-red-500/40'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer border-t border-x ${
              activeTab === 'users'
                ? 'bg-[#080d1e] border-amber-500/60 text-amber-300 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Utilisateurs ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('oracle')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer border-t border-x ${
              activeTab === 'oracle'
                ? 'bg-[#080d1e] border-amber-500/60 text-amber-300 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Oracle & Réponses Quiz</span>
            {oracleEnabled && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer border-t border-x ${
              activeTab === 'admins'
                ? 'bg-[#080d1e] border-amber-500/60 text-amber-300 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Priorités & Administrateurs ({admins.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <p className="text-xs font-mono">Synchronisation des données serveur...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: USERS & PROFILES */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  {/* Public App URL Bar */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                          Lien Public Universel de l'Application
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] text-emerald-300 font-bold">
                          Sans erreur 403
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-mono mt-1 truncate">
                        {publicAppUrl}
                      </p>
                    </div>

                    <button
                      onClick={handleCopyPublicUrl}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                          <span>Lien Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-950" />
                          <span>Copier l'URL Publique</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Stats Counter Capsule */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Utilisateurs</div>
                      <div className="text-2xl font-bold font-display text-white mt-1">{users.length}</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">En Ligne Actuellement</div>
                      <div className="text-2xl font-bold font-display text-emerald-400 mt-1">
                        {users.filter(u => u.isOnline).length}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Admins avec Priorités</div>
                      <div className="text-2xl font-bold font-display text-amber-300 mt-1">{admins.length}</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Victoires Cumulées</div>
                      <div className="text-2xl font-bold font-display text-cyan-400 mt-1">
                        {users.reduce((acc, u) => acc + (u.wins || 0), 0)}
                      </div>
                    </div>
                  </div>

                  {/* Search Bar & Privacy Notice */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Rechercher par pseudo ou @username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none text-white text-xs placeholder:text-slate-500 font-medium"
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Confidentialité activée : aucun compte Google exposé</span>
                    </div>
                  </div>

                  {/* User Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredUsers.map((user) => {
                      const userIsAdmin = isUserAdmin(user.uid);
                      const isCurrentUser = user.uid === currentUser.uid;

                      return (
                        <div
                          key={user.uid}
                          className={`p-4 rounded-2xl bg-slate-900/70 border transition-all flex flex-col justify-between ${
                            userIsAdmin 
                              ? 'border-amber-500/50 shadow-md shadow-amber-950/30' 
                              : 'border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={user.photoURL}
                                  alt={user.displayName}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
                                />
                                {user.isOnline && (
                                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold font-display text-sm text-white">{user.displayName}</span>
                                  {userIsAdmin && (
                                    <span title="Administrateur">
                                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-cyan-400 font-mono">@{user.username}</div>
                                <div className="text-[10px] text-amber-300 font-display mt-0.5">
                                  {user.rankTitle} • Niv. {user.level}
                                </div>
                              </div>
                            </div>

                            {/* Admin delegation button */}
                            {!isCurrentUser && (
                              <div>
                                {userIsAdmin ? (
                                  <button
                                    onClick={() => handleRevokeAdmin(user.uid, user.displayName)}
                                    disabled={actionLoading === user.uid}
                                    className="p-1.5 px-2.5 rounded-lg bg-red-950/60 border border-red-500/50 hover:bg-red-900/60 text-red-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <UserMinus className="w-3.5 h-3.5" />
                                    <span>Révoquer Admin</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleGrantAdmin(user)}
                                    disabled={actionLoading === user.uid}
                                    className="p-1.5 px-2.5 rounded-lg bg-amber-950/60 border border-amber-500/50 hover:bg-amber-900/60 text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                                  >
                                    <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Donner Priorités Admin</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Stats footer */}
                          <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
                            <div className="bg-slate-950/60 rounded-lg p-1.5">
                              <div className="text-[9px] uppercase text-slate-400">Victoires</div>
                              <div className="text-xs font-bold text-emerald-400 font-mono">{user.wins}</div>
                            </div>
                            <div className="bg-slate-950/60 rounded-lg p-1.5">
                              <div className="text-[9px] uppercase text-slate-400">Défaites</div>
                              <div className="text-xs font-bold text-red-400 font-mono">{user.losses}</div>
                            </div>
                            <div className="bg-slate-950/60 rounded-lg p-1.5">
                              <div className="text-[9px] uppercase text-slate-400">XP Total</div>
                              <div className="text-xs font-bold text-cyan-300 font-mono">{user.xp}</div>
                            </div>
                            <div className="bg-slate-950/60 rounded-lg p-1.5">
                              <div className="text-[9px] uppercase text-slate-400">Points</div>
                              <div className="text-xs font-bold text-amber-300 font-mono">{user.points}</div>
                            </div>
                          </div>

                          {/* Bio */}
                          {user.bio && (
                            <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-2">
                              « {user.bio} »
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {filteredUsers.length === 0 && (
                    <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
                      Aucun profil utilisateur ne correspond à votre recherche.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ORACLE QUIZ (TOUJOURS AVOIR LES RÉPONSES) */}
              {activeTab === 'oracle' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Oracle Status Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-blue-950/60 to-slate-900 border border-cyan-500/50 shadow-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 text-2xl shadow-md">
                          👁️
                        </div>
                        <div>
                          <h3 className="text-base font-bold font-display text-white">
                            Mode Oracle : Révélation Immédiate des Réponses
                          </h3>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            Permet au compte Google <span className="text-cyan-300 font-mono font-bold">demaboudjunior07@gmail.com</span> et aux administrateurs autorisés d'avoir en permanence les réponses correctes révélées lors de toutes les questions de quiz (Solo, Duels en direct, Combats de guilde).
                          </p>
                        </div>
                      </div>

                      {/* Toggle button */}
                      <button
                        onClick={() => onToggleOracle(!oracleEnabled)}
                        className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                          oracleEnabled ? 'bg-cyan-500 shadow-lg shadow-cyan-500/30' : 'bg-slate-800'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full bg-white transition-transform absolute top-1 ${
                          oracleEnabled ? 'right-1' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-cyan-900/40 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Statut de la Révélation :</span>
                      <span className={`font-bold font-mono ${oracleEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {oracleEnabled ? '✓ ACTIVÉ (RÉPONSES VISIBLES DIRECTEMENT)' : '✕ DÉSACTIVÉ'}
                      </span>
                    </div>
                  </div>

                  {/* Visual Simulation of how it looks */}
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Aperçu en Jeu (Ce que vous voyez pendant le quiz)</span>
                    </h4>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="text-xs text-slate-400">Question exemple : Quelle est la véritable forme de Naruto en mode Kurama ?</div>
                      
                      {/* Fake Option with Oracle Highlight */}
                      <div className="p-3 rounded-xl border border-emerald-500/80 bg-emerald-950/40 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded bg-emerald-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center">
                            C
                          </span>
                          <span className="text-xs font-bold text-white">Mode Bijuu</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono text-[10px] font-bold">
                          ✓ Révélation Admin (Bonne Réponse)
                        </span>
                      </div>

                      <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 opacity-60 flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded bg-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center">
                          A
                        </span>
                        <span className="text-xs text-slate-300">Mode Ermite</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ADMINS & DELEGATIONS */}
              {activeTab === 'admins' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200">
                    <div className="flex items-center gap-2 font-bold mb-1 text-amber-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Gestion des Privilèges et Délégation</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Chaque utilisateur listé ici dispose des <strong>mêmes priorités complètes</strong> : accès permanent à ce panneau d'administration, consultation de l'ensemble des profils joueurs, révélation des réponses aux quiz, et possibilité de déléguer ces mêmes droits.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Master Root Admin */}
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-bold">
                          👑
                        </div>
                        <div>
                          <div className="text-sm font-bold font-display text-white flex items-center gap-2">
                            <span>Maître Administrateur Fondateur</span>
                            <span className="px-2 py-0.2 rounded bg-amber-400 text-slate-950 font-mono text-[9px] font-bold uppercase">
                              Indéboulonnable
                            </span>
                          </div>
                          <div className="text-xs text-amber-300 font-mono">demaboudjunior07@gmail.com</div>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold">Priorité Absolue</span>
                    </div>

                    {/* Delegated Admins list */}
                    {admins.map((admin) => (
                      <div 
                        key={admin.uid}
                        className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                            🛡️
                          </div>
                          <div>
                            <div className="text-sm font-bold font-display text-white">
                              {admin.displayName || 'Utilisateur'}
                            </div>
                            <div className="text-xs text-cyan-400 font-mono">
                              @{admin.username || admin.uid.slice(0, 8)}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>Accordé le {new Date(admin.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        </div>

                        {admin.uid !== currentUser.uid && (
                          <button
                            onClick={() => handleRevokeAdmin(admin.uid, admin.displayName)}
                            disabled={actionLoading === admin.uid}
                            className="p-2 px-3 rounded-xl bg-red-950/60 border border-red-500/50 hover:bg-red-900/60 text-red-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <UserMinus className="w-4 h-4" />
                            <span>Révoquer</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
