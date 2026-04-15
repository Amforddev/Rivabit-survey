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
  showToast: (title: string, message: string) => void;
}

const RewardsView: React.FC<RewardsViewProps> = ({ userProfile, redeemReward, redemptions, showToast }) => {
  const [activeCategory, setActiveCategory] = useState<string>(REWARD_CATEGORIES[0].id);
  const [selectedOption, setSelectedOption] = useState<RewardOption | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [raffleTicket, setRaffleTicket] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<{ticketNumber: string, drawTitle: string, date: string} | null>(null);

  const category = REWARD_CATEGORIES.find(c => c.id === activeCategory)!;
  const CategoryIcon = (Icons as any)[category.iconName];

  const handleConfirm = () => {
    if (!selectedOption) return;
    if (userProfile.berry < selectedOption.cost) {
      showToast('Insufficient Berry', `You need ${selectedOption.cost - userProfile.berry} more Berry to redeem this.`);
      setSelectedOption(null);
      return;
    }
    
    // For raffle, generate a mock ticket number
    const details: any = {};
    if (activeCategory === 'raffle') {
      const ticket = '#' + Math.random().toString(36).substring(2, 8).toUpperCase();
      details.ticketNumber = ticket;
      setRaffleTicket(ticket);
    }
    
    redeemReward(selectedOption, details);
    
    setShowSuccess(true);
    if (activeCategory !== 'raffle') {
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedOption(null);
      }, 2000);
    }
  };

  const handleShare = () => {
    // Automatically claim the prize
    showToast('Prize Claimed!', '₦50,000 has been added to your wallet balance.');
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
        <p className="text-gray-500 text-sm mb-6">Spend your Berry on awesome rewards.</p>
        
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
              const canAfford = userProfile.berry >= option.cost;
              const myTickets = redemptions.filter(r => r.rewardId === option.id);

              return (
                <div key={option.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 text-lg">{option.title}</h4>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                      {activeCategory === 'raffle' && myTickets.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-1 text-sm font-medium text-gray-900 bg-gray-100 w-fit px-2 py-1 rounded-md">
                            <Ticket size={14} />
                            <span>You have {myTickets.length} ticket{myTickets.length > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {myTickets.map((t, idx) => {
                              const tNum = t.details?.ticketNumber || `#TKT-${idx+1}`;
                              return (
                                <button 
                                  key={idx} 
                                  onClick={() => setSelectedTicket({
                                    ticketNumber: tNum,
                                    drawTitle: option.title,
                                    date: new Date(t.redeemedAt?.toDate() || Date.now()).toLocaleDateString()
                                  })}
                                  className="text-xs font-mono bg-gray-50 border border-gray-200 px-2 py-1 rounded text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
                                >
                                  {tNum}
                                </button>
                              );
                            })}
                          </div>
                          {/* Mock Winning Ticket Logic */}
                          {option.id === 'r1' && (
                            <div className="bg-secondary/10 border border-secondary/20 p-3 rounded-xl mt-2">
                              <p className="text-xs text-secondary font-semibold mb-1">Winner Ticket</p>
                              <p className="text-sm font-medium text-gray-900">Ticket: #A10294</p>
                              {myTickets.some(t => t.details?.ticketNumber === '#A10294') && (
                                <button 
                                  onClick={() => setShowShareModal(true)}
                                  className="mt-2 text-xs font-medium text-white bg-secondary px-3 py-1.5 rounded-lg hover:bg-secondary/90 transition-colors"
                                >
                                  Claim Prize
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 text-primary font-semibold bg-gray-100 px-2.5 py-1 rounded-lg">
                        <Coins size={16} />
                        {option.cost}
                      </div>
                      {option.status && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap ${
                          option.status === 'Open' ? 'bg-secondary/10 text-secondary' :
                          option.status === 'Drawing Soon' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {option.status}
                        </span>
                      )}
                    </div>
                  </div>
                  {option.status !== 'Closed' && (
                    <button
                      onClick={() => setSelectedOption(option)}
                      className="w-full bg-accent text-white py-3 px-5 rounded-full font-semibold text-base flex items-center justify-between transition-all hover:opacity-90 active:scale-[0.98] shadow-sm mt-2 group"
                    >
                      <span>{activeCategory === 'raffle' ? 'Buy Ticket' : 'Redeem Now'}</span>
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform">
                        <Icons.ArrowRight size={16} />
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl relative"
            >
              <button 
                onClick={() => setSelectedTicket(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <Icons.X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                <Ticket size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Ticket Details</h3>
              
              <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Draw</span>
                  <span className="font-medium text-gray-900">{selectedTicket.drawTitle}</span>
                </div>
                <div className="h-px bg-gray-200 w-full"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Ticket Number</span>
                  <span className="font-bold font-mono text-lg text-primary">{selectedTicket.ticketNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Purchased</span>
                  <span className="font-medium text-gray-900">{selectedTicket.date}</span>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedTicket(null)}
                className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              className="bg-white w-full sm:w-[360px] rounded-t-[2rem] sm:rounded-[2rem] p-6 pb-10 sm:pb-8 shadow-xl"
            >
              {showSuccess ? (
                <div className="py-8 flex flex-col items-center text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-gray-100 text-primary rounded-full flex items-center justify-center mb-4"
                  >
                    <CheckCircle2 size={40} />
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {activeCategory === 'raffle' ? 'Ticket Secured!' : 'Redemption Successful!'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {activeCategory === 'raffle' ? 'Good luck in the draw. Your ticket number is below.' : 'Funds have been added to your wallet.'}
                  </p>
                  
                  {activeCategory === 'raffle' && raffleTicket && (
                    <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 mb-6">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Your Ticket Number</p>
                      <p className="text-3xl font-mono font-bold text-primary">{raffleTicket}</p>
                    </div>
                  )}

                  <div className="w-full space-y-3">
                    {activeCategory === 'raffle' && (
                      <button 
                        onClick={() => {
                          setShowSuccess(false);
                          setSelectedOption(null);
                          setRaffleTicket(null);
                          setShowShareModal(true);
                        }}
                        className="w-full bg-primary text-white py-4 rounded-xl font-medium text-lg hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        Claim Prize
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setShowSuccess(false);
                        setSelectedOption(null);
                        setRaffleTicket(null);
                      }}
                      className="w-full bg-white text-gray-700 py-4 rounded-xl font-medium text-lg hover:bg-gray-50 transition-colors border border-gray-200"
                    >
                      {activeCategory === 'raffle' ? 'Dismiss' : 'Close'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
                  <div className={`w-16 h-16 rounded-full bg-gray-100 text-primary flex items-center justify-center mx-auto mb-4`}>
                    {CategoryIcon && <CategoryIcon size={32} />}
                  </div>
                  <h3 className="text-2xl font-semibold text-center text-gray-900 mb-2">Confirm Redemption</h3>
                  <p className="text-center text-gray-500 mb-6">
                    Spend <span className="font-medium text-gray-900">{selectedOption.cost} Berry</span> on {selectedOption.title}?
                  </p>
                  
                  {userProfile.berry < selectedOption.cost && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 flex items-start gap-2 text-sm font-medium border border-red-100">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>Not enough Berry. You need {selectedOption.cost - userProfile.berry} more Berry.</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button 
                      onClick={handleConfirm}
                      disabled={userProfile.berry < selectedOption.cost}
                      className="w-full bg-accent text-white py-4 px-6 rounded-full font-semibold text-lg flex items-center justify-between transition-all hover:opacity-90 active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <span>Confirm & Redeem</span>
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform">
                        <Icons.ArrowRight size={20} />
                      </div>
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
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <Share2 size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Claim Your Prize</h3>
              <p className="text-sm text-gray-500 mb-6">Click the button below to instantly claim your raffle winnings!</p>
              
              <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left border border-gray-100">
                <p className="text-sm text-gray-700 font-medium">Congratulations! You've won the weekly draw. Your prize of ₦50,000 is ready for collection.</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 py-3 font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Later
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 py-3 font-medium text-white bg-primary rounded-xl hover:bg-primary/90 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Claim Now
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
