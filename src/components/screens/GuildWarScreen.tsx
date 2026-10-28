import React, { useState, useEffect, useRef } from 'react';
import { Swords, Timer, Shield, AlertTriangle, ArrowRight, Award, CheckCircle, XCircle, Eye, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Guild, UserProfile, QuizQuestion } from '../../types';
import { GuildBadge } from '../GuildBadge';
import { getGuildWarQuestions } from '../../data/questions';
import { recordGuildWarResult } from '../../services/guildService';

interface GuildWarScreenProps {
  myGuild: Guild;
  currentUser: UserProfile;
  onWarFinished: () => void;
  onQuit: () => void;
  isAdmin?: boolean;
  oracleEnabled?: boolean;
}

export const GuildWarScreen: React.FC<GuildWarScreenProps> = ({
  myGuild,
  currentUser,
  onWarFinished,
  onQuit,
  isAdmin = false,
  oracleEnabled = true,
}) => {
  // Opponent guild
  const opponentManga = myGuild.manga.toLowerCase().includes('one piece') ? 'Naruto' : 'One Piece';
  const opponentGuildName = myGuild.manga.toLowerCase().includes('one piece') ? 'Akatsuki Syndicate' : 'Straw Hat Pirates';
  const opponentBadge = myGuild.manga.toLowerCase().includes('one piece') ? '☁️' : '☠️';

  // Questions: 10 from myGuild.manga + 10 from opponentManga = 20 questions
  const [questions] = useState<QuizQuestion[]>(() => getGuildWarQuestions(myGuild.manga, opponentManga));
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds per question in Guild Wars!
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);

  // Guild War points & scores
  const [myGuildCorrect, setMyGuildCorrect] = useState(0);
  const [opponentGuildCorrect, setOpponentGuildCorrect] = useState(0);

  // Final war state
  const [isWarOver, setIsWarOver] = useState(false);
  const [warOutcome, setWarOutcome] = useState<{ isVictory: boolean; myRate: number; oppRate: number; disbanded: boolean } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQ = questions[currentIndex] || questions[0];
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    if (isWarOver || isAnswerLocked) return;

    setTimeLeft(10);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isWarOver, isAnswerLocked]);

  const handleTimeExpired = () => {
    setIsAnswerLocked(true);
    // Opponent team answering
    simulateOpponentTeam();
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerLocked || isWarOver) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(idx);
    setIsAnswerLocked(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setMyGuildCorrect((prev) => prev + 1);
    }

    simulateOpponentTeam();
  };

  const simulateOpponentTeam = () => {
    // 70% success rate on their own manga questions, 50% on opponent's
    const isTheirManga = currentQ.manga.toLowerCase().includes(opponentManga.toLowerCase());
    const oppProb = isTheirManga ? 0.75 : 0.5;
    if (Math.random() < oppProb) {
      setOpponentGuildCorrect((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerLocked(false);
    } else {
      finalizeGuildWar();
    }
  };

  const finalizeGuildWar = async () => {
    setIsWarOver(true);

    const myRate = Math.round((myGuildCorrect / questions.length) * 100);
    const oppRate = Math.round((opponentGuildCorrect / questions.length) * 100);
    const isVictory = myRate >= oppRate;

    try {
      const result = await recordGuildWarResult(myGuild.id, isVictory, myRate);
      setWarOutcome({
        isVictory,
        myRate,
        oppRate,
        disbanded: result.isDisbandedNow
      });

      if (isVictory) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Erreur enregistrement guerre:', err);
    }
  };

  // 1. WAR OVER VIEW (Mockup 11)
  if (isWarOver && warOutcome) {
    return (
      <div className="max-w-lg mx-auto p-6 rounded-3xl bg-[#0b1329] border border-cyan-500/40 text-center shadow-2xl animate-fadeIn space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-red-500/20 to-orange-600/30 border border-red-500/50 flex items-center justify-center text-4xl shadow-lg">
          {warOutcome.isVictory ? '🏆' : '⚔️'}
        </div>

        <div>
          <h2 className="text-3xl font-extrabold font-display text-white tracking-wide">
            {warOutcome.isVictory ? 'VICTOIRE DE GUILDE !' : 'DÉFAITE EN COMBAT'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Combat de 20 questions inter-mangas achevé ({myGuild.manga} vs {opponentManga}).
          </p>
        </div>

        {/* War Score Banner (Mockup 11) */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-around">
          <div className="text-center flex flex-col items-center">
            <GuildBadge badge={myGuild.badge} name={myGuild.name} sizeClassName="w-12 h-12" className="mb-1.5" />
            <div className="text-xs font-bold font-display text-white">{myGuild.name}</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{warOutcome.myRate}%</div>
            <div className="text-[10px] text-slate-400">{myGuildCorrect}/20 réussies</div>
          </div>

          <div className="text-sm font-bold font-display text-red-500 uppercase px-2">
            VS
          </div>

          <div className="text-center flex flex-col items-center">
            <GuildBadge badge={opponentBadge} name={opponentGuildName} sizeClassName="w-12 h-12" className="mb-1.5" />
            <div className="text-xs font-bold font-display text-white">{opponentGuildName}</div>
            <div className="text-2xl font-bold font-mono text-red-400 mt-1">{warOutcome.oppRate}%</div>
            <div className="text-[10px] text-slate-400">{opponentGuildCorrect}/20 réussies</div>
          </div>
        </div>

        {/* 20 Losses Warning or Disband Alert */}
        {warOutcome.disbanded ? (
          <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500 text-left text-xs text-red-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>GUILDE DISSOUTE</span>
            </div>
            <p>La guilde a atteint le seuil maximal de 20 défaites et a été automatiquement dissoute du classement mondial.</p>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-300">
            <span className="font-bold text-cyan-400">Règle de pérennité des guildes : </span>
            <span>{warOutcome.isVictory ? '+1 Victoire ajoutée au palmarès.' : '+1 Défaite enregistrée (Survie : ' + (myGuild.losses + 1) + '/20 défaites).'}</span>
          </div>
        )}

        <button
          onClick={onWarFinished}
          className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-display uppercase tracking-wider text-xs transition-colors cursor-pointer"
        >
          Retourner au Quartier Général
        </button>
      </div>
    );
  }

  // 2. ACTIVE GUILD WAR VIEW matching Mockup 11
  const currentRateMy = currentIndex > 0 ? Math.round((myGuildCorrect / (currentIndex + (isAnswerLocked ? 1 : 0))) * 100) : 100;
  const currentRateOpp = currentIndex > 0 ? Math.round((opponentGuildCorrect / (currentIndex + (isAnswerLocked ? 1 : 0))) * 100) : 80;

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fadeIn pb-20">
      {/* Top Guild vs Guild Header (Mockup 11) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-red-950/60 border border-red-500/40 shadow-xl flex items-center justify-between">
        {/* Guild 1 */}
        <div className="flex items-center gap-2.5">
          <GuildBadge badge={myGuild.badge} name={myGuild.name} sizeClassName="w-10 h-10" />
          <div>
            <div className="text-xs font-bold font-display text-white truncate max-w-[110px] sm:max-w-[140px]">
              {myGuild.name}
            </div>
            <div className="text-xs font-mono font-bold text-cyan-400">
              {currentRateMy}% réussite
            </div>
          </div>
        </div>

        {/* Center Countdown: 10s per question in Guild Wars */}
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
            COMBAT
          </div>
          <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-mono font-bold text-sm ${
            timeLeft <= 3 ? 'border-red-500 text-red-400 animate-pulse' : 'border-cyan-400 text-cyan-300'
          }`}>
            {timeLeft}s
          </div>
        </div>

        {/* Guild 2 */}
        <div className="flex items-center gap-2.5 flex-row-reverse text-right">
          <GuildBadge badge={opponentBadge} name={opponentGuildName} sizeClassName="w-10 h-10" />
          <div>
            <div className="text-xs font-bold font-display text-white truncate max-w-[110px] sm:max-w-[140px]">
              {opponentGuildName}
            </div>
            <div className="text-xs font-mono font-bold text-red-400">
              {currentRateOpp}% réussite
            </div>
          </div>
        </div>
      </div>

      {/* Origin Manga Notice (10 Q manga 1, 10 Q manga 2) */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-mono text-slate-400">
          Question <strong className="text-cyan-400">{currentIndex + 1}</strong> / {questions.length}
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-cyan-500/40 text-cyan-300 font-semibold text-[10px]">
          Manga : {currentQ.manga}
        </span>
      </div>

      {/* Question Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0b1329] border border-cyan-500/30 text-center shadow-xl space-y-3">
        {isAdmin && oracleEnabled && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-400 text-amber-300 text-[11px] font-mono font-bold shadow-md shadow-amber-950/40 animate-pulse">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>ORACLE ADMIN : Réponse {optionLetters[currentQ.correctIndex]}</span>
          </div>
        )}
        <p className="text-base font-bold font-sans text-white leading-snug">
          {currentQ.question}
        </p>
      </div>

      {/* 5 Options */}
      <div className="space-y-2.5">
        {currentQ.options.map((option, idx) => {
          const letter = optionLetters[idx];
          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentQ.correctIndex;
          const isOracleHighlight = !isAnswerLocked && isAdmin && oracleEnabled && isCorrect;

          let btnStyle = 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/50 text-slate-200';
          let letterStyle = 'bg-slate-800 text-slate-400 border-slate-700';

          if (isOracleHighlight) {
            btnStyle = 'bg-amber-950/40 border-amber-400/90 text-white shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/60';
            letterStyle = 'bg-amber-400 text-slate-950 border-amber-300 font-bold';
          }

          if (isAnswerLocked) {
            if (isCorrect) {
              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-white';
              letterStyle = 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold';
            } else if (isSelected && !isCorrect) {
              btnStyle = 'bg-red-950/80 border-red-500 text-white';
              letterStyle = 'bg-red-500 text-white border-red-400 font-bold';
            } else {
              btnStyle = 'opacity-40 bg-slate-950 border-slate-900 text-slate-500';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswerLocked}
              className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold font-mono shrink-0 ${letterStyle}`}>
                  {letter}
                </span>
                <span className="text-sm font-semibold">{option}</span>
              </div>
              {isAnswerLocked && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
              {isAnswerLocked && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {isAnswerLocked && (
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
        >
          <span>{currentIndex + 1 < questions.length ? 'Question Suivante' : 'Calculer le Résultat du Combat'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      <div className="text-center">
        <button onClick={onQuit} className="text-xs text-slate-500 hover:text-red-400 cursor-pointer">
          Quitter le combat (comptera comme questions manquées)
        </button>
      </div>
    </div>
  );
};
