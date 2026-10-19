/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useGameSocket } from './hooks/useGameSocket.ts';
import { Header } from './components/Header.tsx';
import { Lobby } from './components/Lobby.tsx';
import { OpeningPhase } from './components/OpeningPhase.tsx';
import { DraftPhase } from './components/DraftPhase.tsx';
import { DiscussionPhase } from './components/DiscussionPhase.tsx';
import { VotingPhase } from './components/VotingPhase.tsx';
import { SalvationPhase } from './components/SalvationPhase.tsx';
import { ResultPhase } from './components/ResultPhase.tsx';
import { ChatBox } from './components/ChatBox.tsx';
import { RulesModal } from './components/RulesModal.tsx';
import { ResetConfirmModal } from './components/ResetConfirmModal.tsx';
import { ImageSheetModal } from './components/ImageSheetModal.tsx';
import { AlertCircle, X } from 'lucide-react';
import mansionStudyBg from './assets/images/mansion_study_bg_1792414771883.jpg';

export default function App() {
  const [rulesOpen, setRulesOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [imageSheetOpen, setImageSheetOpen] = useState(false);

  const {
    isConnected,
    gameState,
    privateState,
    chatMessages,
    playerId,
    isHost,
    errorMessage,
    joinRoom,
    startGame,
    fillBots,
    removeBots,
    kickPlayer,
    proceedToDraft,
    draftAction,
    toggleReady,
    kitsuneDeclare,
    submitVote,
    submitSalvationGuess,
    rematch,
    resetRoom,
    sendChat,
    clearError,
  } = useGameSocket();

  const currentPhase = gameState?.phase || 'lobby';

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-700 selection:text-white relative">
      {/* Dimly lit Victorian Mansion Study Background Image */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={mansionStudyBg}
          alt="洋館の書斎"
          className="w-full h-full object-cover object-center opacity-30 filter brightness-70 contrast-125 scale-105 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        {/* Deep ambient vignette and candlelit glow overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/85 via-stone-950/65 to-stone-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(12,10,9,0.85)_100%)]" />
      </div>

      {/* Top Header */}
      <Header
        isConnected={isConnected}
        playerCount={gameState?.players.length || 0}
        isHost={isHost}
        onOpenRules={() => setRulesOpen(true)}
        onOpenResetConfirm={() => setResetConfirmOpen(true)}
        onOpenImageSheet={() => setImageSheetOpen(true)}
      />

      {/* Error alert toast */}
      {errorMessage && (
        <div className="sticky top-14 z-50 max-w-md mx-auto my-2 px-4">
          <div className="p-3 bg-red-950/90 border border-red-700 text-red-200 rounded-xl shadow-2xl flex items-center justify-between gap-2 text-xs backdrop-blur-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={clearError}
              className="p-1 hover:bg-red-900 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col relative z-10">
        {currentPhase === 'lobby' && (
          <Lobby
            gameState={gameState}
            currentUserId={playerId}
            isHost={isHost}
            onJoinRoom={joinRoom}
            onStartGame={startGame}
            onFillBots={fillBots}
            onRemoveBots={removeBots}
            onKickPlayer={kickPlayer}
            onOpenRules={() => setRulesOpen(true)}
            onOpenImageSheet={() => setImageSheetOpen(true)}
            onResetRoom={resetRoom}
          />
        )}

        {currentPhase === 'opening' && gameState && (
          <OpeningPhase
            gameState={gameState}
            currentUserId={playerId}
            isHost={isHost}
            onProceedToDraft={proceedToDraft}
          />
        )}

        {currentPhase === 'drafting' && gameState && (
          <DraftPhase
            gameState={gameState}
            privateState={privateState}
            currentUserId={playerId}
            onDraftAction={draftAction}
          />
        )}

        {(currentPhase === 'first_discussion' ||
          currentPhase === 'word_wolf' ||
          currentPhase === 'final_discussion') &&
          gameState && (
            <DiscussionPhase
              gameState={gameState}
              privateState={privateState}
              currentUserId={playerId}
              onToggleReady={toggleReady}
              onKitsuneDeclare={kitsuneDeclare}
              onOpenRules={() => setRulesOpen(true)}
            />
          )}

        {currentPhase === 'voting' && gameState && (
          <VotingPhase
            gameState={gameState}
            currentUserId={playerId}
            onSubmitVote={submitVote}
            onOpenRules={() => setRulesOpen(true)}
          />
        )}

        {currentPhase === 'salvation' && gameState && (
          <SalvationPhase
            gameState={gameState}
            privateState={privateState}
            currentUserId={playerId}
            onSubmitSalvationGuess={submitSalvationGuess}
          />
        )}

        {currentPhase === 'result' && gameState && (
          <ResultPhase
            gameState={gameState}
            currentUserId={playerId}
            onRematch={rematch}
          />
        )}
      </main>

      {/* In-game text communication and system activity log */}
      {gameState && (
        <ChatBox
          messages={chatMessages}
          currentUserId={playerId}
          onSendMessage={sendChat}
        />
      )}

      {/* Rules Modal */}
      <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirmReset={resetRoom}
      />

      {/* Image Sheet Upload & Crop Modal */}
      <ImageSheetModal
        isOpen={imageSheetOpen}
        onClose={() => setImageSheetOpen(false)}
      />
    </div>
  );
}
