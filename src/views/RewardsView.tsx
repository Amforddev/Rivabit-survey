import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, CheckCircle2, Ticket, AlertCircle, Share2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { RewardOption, UserProfile, Redemption } from '../types';
import { REWARD_CATEGORIES } from '../data';

interface RewardsViewProps {
  userProfile: UserProfile;
  redeemReward: (opt: RewardOption, details?: any) => void;
  redemptions: Redemption[];
}

const RewardsView: React.FC<RewardsViewProps> = ({ userProfile, redeemReward, redemptions }) => {
  const [activeCategory, setActiveCategory] = useState<string>(REWARD_CATEGORIES[0].id);
  const [selectedOption, setSelectedOption] = useState<RewardOption | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const category = REWARD_CATEGORIES.find(c => c.id === activeCategory)!;
  const CategoryIcon = (Icons as any)[category.iconName];

  const handleConfirm = () => {
    if (!selectedOption) return;
    if (userProfile.bits < selectedOption.cost) return;
    
    // For raffle, generate a mock ticket number
    const details: any = {};
    if (activeCategory === 'raffle') {
      details.ticketNumber = '#' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    redeemReward(selectedOption, details);
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedOption(null);
    }, 2000);
  };

  const handleShare = () => {
    const text = `I just won the raffle draw on @rivabit! 🎉 Join me and start earning today.`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    setShowShareModal(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="h-full flex flex-col"
    >
      <div className="p-6 pb-2">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Rewards Store</h2>
        <p className="text-gray-500 text-sm mb-6">Spend your Bits on awesome rewards.</p>
        
        {/* Horizontal Category Scroll */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          {REWARD_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            const Icon = (Icons as any)[cat.iconName];
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap font-medium text-sm transition-colors border ${
                  isActive 
                    ? `bg-gray-100 text-gray-900 border-gray-300` 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {Icon && <Icon size={16} />}
                {cat.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Options List */}
      <div className="flex-1 p-6 pt-2 space-y-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {category.options.map(option => {
              const canAfford = userProfile.bits >= option.cost;
              const myTickets = redemptions.filter(r => r.rewardId === option.id);

              return (
                <div key={option.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 text-lg">{option.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                      {activeCategory === 'raffle' && myTickets.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-1 text-sm font-medium text-gray-900 bg-gray-100 w-fit px-2 py-1 rounded-md">
                            <Ticket size={14} />
                            <span>You have {myTickets.length} ticket{myTickets.length > 1 ? 's' : ''}</span>
                          </div>
                          {/* Mock Winning Ticket Logic */}
                          {option.id === 'r1' && (
                            <div className="bg-green-50 border border-green-200 p-3 rounded-xl mt-2">
                              <p className="text-xs text-green-600 font-semibold mb-1">Previous Draw Winner</p>
                              <p className="text-sm font-medium text-gray-900">Ticket: #A10294</p>
                              <button 
                                onClick={() => setShowShareModal(true)}
                                className="mt-2 text-xs font-medium text-white bg-green-600 px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Claim Prize
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[#1F2937] font-semibold bg-gray-100 px-2.5 py-1 rounded-lg">
                      <Coins size={16} />
                      {option.cost}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOption(option)}
                    className="w-full py-3 rounded-xl font-medium text-sm transition-colors border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 shadow-sm mt-2"
                  >
                    Redeem Now
                  </button>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedOption && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-6"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full sm:w-[360px] rounded-t-[2rem] sm:rounded-[2rem] p-6 pb-safe shadow-xl"
            >
              {showSuccess ? (
                <div className="py-8 flex flex-col items-center text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-gray-100 text-[#1F2937] rounded-full flex items-center justify-center mb-4"
                  >
                    <CheckCircle2 size={40} />
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {activeCategory === 'raffle' ? 'Ticket Secured!' : 'Redemption Successful!'}
                  </h3>
                  <p className="text-gray-500">
                    {activeCategory === 'raffle' ? 'Good luck in the draw. Your ticket number will be available shortly.' : 'Funds have been added to your wallet.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
                  <div className={`w-16 h-16 rounded-full bg-gray-100 text-[#1F2937] flex items-center justify-center mx-auto mb-4`}>
                    {CategoryIcon && <CategoryIcon size={32} />}
                  </div>
                  <h3 className="text-2xl font-semibold text-center text-gray-900 mb-2">Confirm Redemption</h3>
                  <p className="text-center text-gray-500 mb-6">
                    Spend <span className="font-medium text-gray-900">{selectedOption.cost} Bits</span> on {selectedOption.title}?
                  </p>
                  
                  {userProfile.bits < selectedOption.cost && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 flex items-start gap-2 text-sm font-medium border border-red-100">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>Not enough Bits. You need {selectedOption.cost - userProfile.bits} more Bits.</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button 
                      onClick={handleConfirm}
                      disabled={userProfile.bits < selectedOption.cost}
                      className="w-full bg-[#1F2937] text-white py-4 rounded-xl font-medium text-lg hover:bg-gray-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm & Redeem
                    </button>
                    <button 
                      onClick={() => setSelectedOption(null)}
                      className="w-full bg-white text-gray-700 py-4 rounded-xl font-medium text-lg hover:bg-gray-50 transition-colors border border-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-[#1F2937] mx-auto mb-4">
                <Share2 size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Claim Your Prize</h3>
              <p className="text-sm text-gray-500 mb-6">Share your win on social media and tag @rivabit to claim your prize!</p>
              
              <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left border border-gray-100">
                <p className="text-sm text-gray-700 italic">"I just won the raffle draw on @rivabit! 🎉 Join me and start earning today."</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 py-3 font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 py-3 font-medium text-white bg-[#1F2937] rounded-xl hover:bg-gray-900 flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default RewardsView;
