import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, PhoneCall, Shield, Loader2 } from 'lucide-react';
import { UserProfile, PrivateMessage, GroupMessage, GroupChat } from '../../types';
import { GroupAvatar } from '../GroupAvatar';
import { 
  getConversationId, 
  sendPrivateMessage, 
  subscribePrivateMessages,
  sendGroupMessage,
  subscribeGroupMessages 
} from '../../services/socialService';

interface ChatScreenProps {
  currentUser: UserProfile;
  // If private chat:
  targetFriend?: { uid: string; displayName: string; photoURL: string } | null;
  // If group chat:
  group?: GroupChat | null;
  onBack: () => void;
  onStartCall?: (target: { uid: string; displayName: string; photoURL: string }) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  currentUser,
  targetFriend,
  group,
  onBack,
  onStartCall,
}) => {
  const isGroup = Boolean(group);
  const conversationId = targetFriend ? getConversationId(currentUser.uid, targetFriend.uid) : '';

  const [messages, setMessages] = useState<(PrivateMessage | GroupMessage)[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to real-time messages
  useEffect(() => {
    let unsub: (() => void) | undefined;

    if (isGroup && group) {
      unsub = subscribeGroupMessages(group.id, (list) => {
        setMessages(list);
      });
    } else if (conversationId) {
      unsub = subscribePrivateMessages(conversationId, (list) => {
        setMessages(list);
      });
    }

    return () => {
      if (unsub) unsub();
    };
  }, [conversationId, isGroup, group]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean || isSending) return;

    setIsSending(true);
    setInputText('');
    try {
      if (isGroup && group) {
        await sendGroupMessage(group.id, currentUser, clean);
      } else if (targetFriend && conversationId) {
        await sendPrivateMessage(currentUser, targetFriend.uid, conversationId, clean);
      }
    } catch (err) {
      console.error('Erreur envoi message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const title = isGroup ? group?.name : targetFriend?.displayName;
  const photo = isGroup ? undefined : targetFriend?.photoURL;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto rounded-3xl bg-[#090e1d] border border-cyan-900/40 overflow-hidden shadow-2xl animate-fadeIn">
      {/* Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {isGroup ? (
            <GroupAvatar
              avatarUrl={group?.avatarUrl}
              name={group?.name}
              category={group?.category}
              sizeClassName="w-10 h-10"
            />
          ) : (
            photo && (
              <img src={photo} alt={title} className="w-10 h-10 rounded-full object-cover border border-cyan-400" />
            )
          )}

          <div>
            <h3 className="text-sm font-bold font-display text-white">{title}</h3>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{isGroup ? `${group?.memberUids?.length || 1} participants` : 'En ligne'}</span>
            </div>
          </div>
        </div>

        {!isGroup && targetFriend && onStartCall && (
          <button
            onClick={() => onStartCall(targetFriend)}
            title="Appel en direct"
            className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
            <Shield className="w-8 h-8 mb-2 text-cyan-500/40" />
            <p className="font-semibold text-slate-400">Aucun message pour le moment</p>
            <p className="text-[11px] text-slate-500 mt-1">Commencez la conversation en envoyant un message sécurisé ci-dessous.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderUid === currentUser.uid;
            const timeStr = new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isMe && (
                  <img
                    src={msg.senderPhoto}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0 mb-1"
                  />
                )}
                <div
                  className={`max-w-[78%] p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md shadow-cyan-950/40'
                      : 'bg-slate-800/90 text-slate-200 rounded-bl-none border border-slate-700/60'
                  }`}
                >
                  {isGroup && !isMe && (
                    <div className="text-[10px] font-bold text-cyan-300 mb-1 font-display">
                      {msg.senderName}
                    </div>
                  )}
                  <p className="break-words">{msg.content}</p>
                  <div
                    className={`text-[9px] mt-1 text-right font-mono ${
                      isMe ? 'text-cyan-200' : 'text-slate-400'
                    }`}
                  >
                    {timeStr}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/90 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Écrivez votre message..."
          maxLength={2000}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-white text-xs placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
