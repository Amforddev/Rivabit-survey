import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, View } from '../types';
import { getRipenessStage, RIPENESS_STAGES } from '../utils/ripeness';

interface GamificationHubViewProps {
  userProfile: UserProfile;
  setView: (view: View) => void;
}

export const GamificationHubView: React.FC<GamificationHubViewProps> = ({ userProfile, setView }) => {
  const progressionPoints = userProfile.nectar || userProfile.berry || 0; 
  const { currentStage, nextStage, progress } = getRipenessStage(progressionPoints);
  const CurrentIcon = Icons[currentStage.icon as keyof typeof Icons] as React.ElementType;
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedStage, setSelectedStage] = useState<typeof RIPENESS_STAGES[0] | null>(null);

  useEffect(() => {
    // If they have progressed above Seed, trigger confetti on first load for demo purposes
    if (progressionPoints >= 100) {
      setTimeout(() => {
        triggerConfetti();
      }, 500);
    }
  }, [progressionPoints]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#f43f5e']
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 pb-[80px]">
      <header className="bg-white px-5 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setView('home')}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Icons.ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Gamification Hub</h1>
          <div className="w-10 h-10"></div> {/* Spacer for centering */}
        </div>
        
        {/* Sunshine Streak Summary in Header */}
        <div className="flex items-center justify-center gap-2 bg-amber-50 rounded-2xl p-3 border border-amber-100 shadow-sm relative overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -right-4 -top-4 opacity-20"
          >
            <Icons.Sun size={80} className="fill-amber-400 text-amber-500" />
          </motion.div>
          <div className="flex items-center justify-center gap-2 z-10">
            <Icons.Sun size={24} className="fill-amber-400 text-amber-500" />
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Sunshine Streak</p>
              <h2 className="text-xl font-black text-amber-700 leading-none">{userProfile.sunshineStreak || 0} Days</h2>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 pb-20 space-y-6 relative">
        {/* Ripeness Progress Dashboard */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Current Stage</p>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${currentStage.color} shadow-sm`}>
                  {CurrentIcon && <CurrentIcon size={16} />}
                </div>
                <h3 className="font-black text-gray-900 text-2xl tracking-tight">{currentStage.name}</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200 block mb-1">
                {currentStage.multiplier}x Payout
              </span>
              <p className="font-bold text-primary text-xl flex items-center justify-end gap-1">
                {progressionPoints} <Icons.Droplets size={14} className="fill-primary/20" />
              </p>
            </div>
          </div>

          <div className="relative mb-8">
            {nextStage && (
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                <span>{currentStage.nectar}</span>
                <span>{nextStage.nectar}</span>
              </div>
            )}
            <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`absolute top-0 left-0 h-full ${currentStage.color} opacity-80`} 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 w-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1 relative z-0">
            {RIPENESS_STAGES.map((stage, index) => {
              const StageIcon = Icons[stage.icon as keyof typeof Icons] as React.ElementType;
              const isReached = progressionPoints >= stage.nectar;
              const isCurrent = stage.name === currentStage.name;
              
              return (
                <div 
                  key={stage.name} 
                  className="flex flex-col items-center gap-1.5 relative group cursor-pointer"
                  onClick={() => setSelectedStage(stage)}
                >
                  <motion.div 
                    whileHover={{ scale: 1.2 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCurrent ? `${stage.color} text-white shadow-md ring-4 ring-${stage.color}/20 z-10` : 
                      isReached ? `${stage.color} text-white opacity-50` : 
                      'bg-gray-100 text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {StageIcon && (
                      <motion.div
                        animate={isCurrent ? { y: [0, -2, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <div className="relative w-[18px] h-[18px]">
                          {/* Outlined base */}
                          <motion.div
                            animate={{ color: isReached ? '#ffffff' : '#9ca3af' }}
                            className="absolute inset-0"
                          >
                            <StageIcon size={18} fill="none" color="inherit" />
                          </motion.div>
                          {/* Filled overlay */}
                          <motion.div
                            initial={false}
                            animate={{ opacity: isReached ? 1 : 0, color: '#ffffff' }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0"
                          >
                            <StageIcon size={18} fill="currentColor" color="inherit" />
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                    {stage.name}
                  </span>
                </div>
              );
            })}
            
            {/* Connecting line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100 -z-10" />
          </div>
          
          <button 
            onClick={triggerConfetti}
            className="mt-6 w-full py-3 bg-gray-50 text-gray-700 rounded-2xl font-bold text-sm border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <Icons.PartyPopper size={16} /> Simulate Level Up Celebration
          </button>
        </motion.section>

        {/* Weekly Activity removed */}
      </div>

      <AnimatePresence>
        {selectedStage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStage(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-sm relative overflow-hidden flex flex-col"
            >
              {(() => {
                const SelectedStageIcon = Icons[selectedStage.icon as keyof typeof Icons] as React.ElementType;
                const isReached = progressionPoints >= selectedStage.nectar;
                return (
                  <>
                    <div className={`${selectedStage.color} p-6 flex flex-col items-center justify-center text-white relative`}>
                      <button 
                        onClick={() => setSelectedStage(null)}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        <Icons.X size={16} />
                      </button>
                      <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-3 shadow-inner">
                        <SelectedStageIcon size={40} fill="currentColor" />
                      </div>
                      <h2 className="text-2xl font-black tracking-tight">{selectedStage.name} Stage</h2>
                      <p className="text-white/80 text-sm font-medium uppercase tracking-wider mt-1">{isReached ? 'Unlocked' : 'Locked'}</p>
                    </div>
                    <div className="p-6 space-y-5">
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
                        <div className="mt-0.5 text-amber-500">
                          <Icons.TrendingUp size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm mb-1">Cashout Multiplier</h4>
                          <p className="text-sm text-gray-600">Your berries convert to Naira at <strong className="text-gray-900">{selectedStage.multiplier}x</strong> the base rate.</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
                        <div className="mt-0.5 text-primary">
                          <Icons.Droplets size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm mb-1">Requirement</h4>
                          <p className="text-sm text-gray-600">You need <strong className="text-gray-900">{selectedStage.nectar} Nectar</strong> points to reach this stage.</p>
                          {!isReached && (
                            <p className="text-xs text-primary font-semibold mt-2">{selectedStage.nectar - progressionPoints} more Nectar needed</p>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => setSelectedStage(null)}
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-sm ${selectedStage.color}`}
                      >
                        Got it
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamificationHubView;
