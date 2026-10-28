import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Timer, Trophy, ArrowRight, XCircle, CheckCircle, Award, Bot, UserCheck, Sparkles, Eye } from 'lucide-react';
import { QuizQuestion, UserProfile, PlayerScore, MatchOpponent } from '../../types';
import { finalizeMatchResult, ROBOT_OPPONENT } from '../../services/gameService';

interface QuizGameScreenProps {
  userProfile: UserProfile;
  questions: QuizQuestion[];
  mode: 'solo' | 'duel' | 'tournament';
  timerDuration?: number; // 15s standard, 10s for guild wars
  onGameComplete: (updatedProfile?: Partial<UserProfile>) => void;
  onQuit: () => void;
  opponent?: MatchOpponent;
  isAdmin?: boolean;
  oracleEnabled?: boolean;
}

export const QuizGameScreen: React.FC<QuizGameScreenProps> = ({
  userProfile,
  questions,
  mode,
  timerDuration = 15,
  onGameComplete,
  onQuit,
  opponent = ROBOT_OPPONENT,
  isAdmin = false,
  oracleEnabled = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  
  // Real player score
  const [playerScore, setPlayerScore] = useState(0);
  const [playerCorrectCount, setPlayerCorrectCount] = useState(0);

  // Opponent score
  const [opponentScore, setOpponentScore] = useState(0);

  // End game state
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [matchRecap, setMatchRecap] = useState<{ isWinner: boolean; rank: number; newStats?: Partial<UserProfile> } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQ = questions[currentIndex] || questions[0];
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  // Countdown timer logic
  useEffect(() => {
    if (isGameOver || isAnswerLocked) return;

    setTimeLeft(timerDuration);
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
  }, [currentIndex, isGameOver, isAnswerLocked, timerDuration]);

  // When time runs out without answer
  const handleTimeExpired = () => {
    setIsAnswerLocked(true);
    simulateOpponentAnswer();
  };

  // Option selection
  const handleSelectOption = (index: number) => {
    if (isAnswerLocked || isGameOver) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(index);
    setIsAnswerLocked(true);

    const isCorrect = index === currentQ.correctIndex;
    if (isCorrect) {
      setPlayerScore((prev) => prev + currentQ.points);
      setPlayerCorrectCount((prev) => prev + 1);
    }

    simulateOpponentAnswer();
  };

  // Opponent answering logic
  const simulateOpponentAnswer = () => {
    if (mode === 'solo') return;

    // Probability based on question difficulty
    const winProb = currentQ.difficulty === 'facile' ? 0.75 : currentQ.difficulty === 'moyen' ? 0.6 : 0.45;
    const oppCorrect = Math.random() < winProb;
    if (oppCorrect) {
      setOpponentScore((prev) => prev + currentQ.points);
    }
  };

  // Next question or finish
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerLocked(false);
    } else {
      finishGame();
    }
  };

  // Game completion & World Victory recording
  const finishGame = async () => {
    setIsGameOver(true);
    setIsSaving(true);

    const finalPlayers: PlayerScore[] = [
      {
        uid: userProfile.uid,
        displayName: userProfile.displayName,
        username: userProfile.username,
        photoURL: userProfile.photoURL,
        score: playerScore,
        correctAnswers: playerCorrectCount,
        streak: 0,
      },
    ];

    if (mode !== 'solo') {
      finalPlayers.push({
        uid: opponent.uid,
        displayName: opponent.displayName,
        username: opponent.isBot ? undefined : opponent.displayName.toLowerCase(),
        photoURL: opponent.photoURL,
        score: opponentScore,
        correctAnswers: Math.round(opponentScore / 20),
        streak: 0,
        isBot: opponent.isBot,
      });
    }

    try {
      const recap = await finalizeMatchResult(finalPlayers, userProfile.uid);
      setMatchRecap(recap);

      if (recap.isWinner) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Erreur enregistrement match:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // 1. GAME OVER VIEW
  if (isGameOver) {
    const isWinner = matchRecap ? matchRecap.isWinner : playerScore >= opponentScore;

    return (
      <div className="max-w-md mx-auto p-6 rounded-3xl bg-[#0b1329] border border-cyan-500/40 text-center shadow-2xl animate-fadeIn">
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center text-4xl shadow-lg">
          {isWinner ? '🏆' : '⚔️'}
        </div>

        <h2 className="text-3xl font-extrabold font-display text-white tracking-wide">
          {isWinner ? 'VICTOIRE ÉCLATANTE !' : 'PARTIE TERMINÉE'}
        </h2>

        <p className="text-slate-300 text-xs sm:text-sm mt-1 mb-6">
          {isWinner
            ? 'Félicitations ! Votre victoire a été enregistrée au Classement Mondial !'
            : 'Bel effort ! Vos points d’expérience et résultats de partie sont conservés.'}
        </p>

        {/* Score comparison card */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className={`p-4 rounded-2xl border ${isWinner ? 'bg-cyan-950/40 border-cyan-500/50 glow-cyan' : 'bg-slate-900 border-slate-800'}`}>
            <img src={userProfile.photoURL} alt={userProfile.displayName} className="w-12 h-12 rounded-full mx-auto mb-2 object-cover border border-cyan-400" />
            <div className="text-xs font-bold text-white truncate">{userProfile.displayName}</div>
            <div className="text-2xl font-bold font-display text-cyan-300 mt-1">{playerScore} pts</div>
            <div className="text-[10px] text-slate-400">{playerCorrectCount}/{questions.length} correctes</div>
          </div>

          {mode !== 'solo' && (
            <div className={`p-4 rounded-2xl border ${!isWinner ? 'bg-violet-950/40 border-violet-500/50' : 'bg-slate-900 border-slate-800'}`}>
              <div className="relative w-12 h-12 mx-auto mb-2">
                <img src={opponent.photoURL} alt={opponent.displayName} className="w-full h-full rounded-full object-cover border border-violet-400" />
                {opponent.isBot && (
                  <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-amber-950 border border-amber-400 text-[8px] font-bold text-amber-300">
                    BOT
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-white truncate">{opponent.displayName}</div>
              <div className="text-2xl font-bold font-display text-violet-300 mt-1">{opponentScore} pts</div>
              <div className="text-[10px] text-slate-400">
                {opponent.isBot ? 'Robot IA' : 'Joueur Réel'}
              </div>
            </div>
          )}
        </div>

        {/* Strict World Victory Status Notice per spec (No currency!) */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-left mb-6 space-y-1 text-slate-300">
          <div className="flex items-center gap-2 font-bold text-cyan-400">
            <Award className="w-4 h-4" />
            <span>Règle du Classement Mondial :</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {isWinner
              ? '✓ Seul le 1er du match (+1 Victoire Mondiale, +150 XP) voit sa victoire ajoutée au classement officiel des victoires.'
              : '• Conformément aux règles, seule la 1ère place accorde une Victoire Mondiale. Vos points (+50 XP) sont bien enregistrés.'}
          </p>
        </div>

        <button
          onClick={() => onGameComplete(matchRecap?.newStats)}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold font-display uppercase tracking-wider text-sm shadow-xl transition-transform hover:scale-[1.02] cursor-pointer"
        >
          Retour au Hub
        </button>
      </div>
    );
  }

  // 2. ACTIVE QUIZ MATCH VIEW
  const isTimerCritical = timeLeft <= 5;

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fadeIn pb-20">
      {/* Top VS Bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-cyan-900/40">
        {/* Player 1 */}
        <div className="flex items-center gap-2.5">
          <img
            src={userProfile.photoURL}
            alt={userProfile.displayName}
            className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400"
          />
          <div>
            <div className="text-xs font-bold font-display text-white truncate max-w-[100px] sm:max-w-[130px]">
              {userProfile.displayName}
            </div>
            <div className="text-xs font-bold font-mono text-cyan-400">
              {playerScore} pts
            </div>
          </div>
        </div>

        {/* Center VS & Circular Timer */}
        <div className="flex flex-col items-center">
          <div className="text-[11px] font-bold font-display text-slate-400 uppercase tracking-widest mb-0.5">
            VS
          </div>
          <div className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center font-mono font-bold text-sm transition-all ${
            isTimerCritical 
              ? 'border-red-500 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-bounce' 
              : 'border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
          }`}>
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Opponent (Duel) or Solo indicator */}
        {mode !== 'solo' ? (
          <div className="flex items-center gap-2.5 flex-row-reverse text-right">
            <div className="relative">
              <img
                src={opponent.photoURL}
                alt={opponent.displayName}
                className={`w-10 h-10 rounded-full object-cover border-2 ${
                  opponent.isBot ? 'border-amber-400 bg-amber-950/40' : 'border-emerald-400'
                }`}
              />
              {opponent.isBot && (
                <span className="absolute -bottom-1 -left-1 px-1 py-0.2 rounded bg-amber-950 border border-amber-400 text-[8px] font-bold text-amber-300">
                  BOT
                </span>
              )}
            </div>
            <div>
              <div className="text-xs font-bold font-display text-white truncate max-w-[100px] sm:max-w-[130px]">
                {opponent.displayName}
              </div>
              <div className={`text-[10px] font-mono font-bold ${
                opponent.isBot ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {opponentScore} pts • {opponent.isBot ? '[ROBOT IA]' : '[JOUEUR RÉEL]'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase">Mode Solo</div>
            <div className="text-xs font-mono text-cyan-400">{playerCorrectCount} réussies</div>
          </div>
        )}
      </div>

      {/* Progress & Difficulty Badge */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-slate-400">
            Question <span className="text-cyan-400 font-bold">{currentIndex + 1}</span> / {questions.length}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-cyan-300 font-semibold">
            {currentQ.manga}
          </span>
        </div>

        {/* Difficulty badge & points */}
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            currentQ.difficulty === 'facile' ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300' :
            currentQ.difficulty === 'moyen' ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-300' :
            currentQ.difficulty === 'difficile' ? 'bg-amber-950 border border-amber-500/40 text-amber-300' :
            'bg-red-950 border border-red-500/40 text-red-300 animate-pulse'
          }`}>
            {currentQ.difficulty} (+{currentQ.points} pts)
          </span>
        </div>
      </div>

      {/* Question Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0b1329] border border-cyan-500/30 text-center shadow-xl space-y-3">
        {isAdmin && oracleEnabled && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-400 text-amber-300 text-[11px] font-mono font-bold shadow-md shadow-amber-950/40 animate-pulse">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>ORACLE ADMIN : Réponse {optionLetters[currentQ.correctIndex]} révélée</span>
          </div>
        )}
        <p className="text-base sm:text-lg font-bold font-sans text-white leading-snug">
          {currentQ.question}
        </p>
      </div>

      {/* 5 Possible Options (A, B, C, D, E per prompt specifications) */}
      <div className="space-y-2.5">
        {currentQ.options.map((optionText, idx) => {
          const letter = optionLetters[idx];
          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentQ.correctIndex;
          const isOracleHighlight = !isAnswerLocked && isAdmin && oracleEnabled && isCorrect;

          let btnStyle = 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/50 text-slate-200';
          let letterStyle = 'bg-slate-800 text-slate-400 border-slate-700';

          if (isOracleHighlight) {
            btnStyle = 'bg-amber-950/40 border-amber-400/90 text-white shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/60 hover:bg-amber-900/50';
            letterStyle = 'bg-amber-400 text-slate-950 border-amber-300 font-bold';
          }

          if (isAnswerLocked) {
            if (isCorrect) {
              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg shadow-emerald-950/40';
              letterStyle = 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold';
            } else if (isSelected && !isCorrect) {
              btnStyle = 'bg-red-950/80 border-red-500 text-white shadow-lg shadow-red-950/40';
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
              className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer group ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-colors ${letterStyle}`}>
                  {letter}
                </span>
                <span className="text-sm font-semibold tracking-wide">
                  {optionText}
                </span>
              </div>

              {isOracleHighlight && (
                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/70 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Bonne Réponse
                </span>
              )}

              {isAnswerLocked && isCorrect && (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              {isAnswerLocked && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation & Next Button */}
      {isAnswerLocked && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 animate-fadeIn">
          {currentQ.explanation && (
            <div className="text-xs text-slate-300 italic">
              <span className="font-bold text-cyan-400 not-italic">Info Lore : </span>
              {currentQ.explanation}
            </div>
          )}
          <button
            onClick={handleNextQuestion}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <span>{currentIndex + 1 < questions.length ? 'Question Suivante' : 'Voir les Résultats Finaux'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quit match option */}
      <div className="text-center">
        <button
          onClick={onQuit}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
        >
          Abandonner la partie
        </button>
      </div>
    </div>
  );
};
