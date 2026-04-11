import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, CheckCircle2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { RewardOption, UserProfile } from '../types';
import { REWARD_CATEGORIES } from '../data';

interface RewardsViewProps {
  userProfile: UserProfile;
  redeemReward: (opt: RewardOption, details?: any) => void;
}

const RewardsView: React.FC<RewardsViewProps> = ({ userProfile, redeemReward }) => {
  const [activeCategory, setActiveCategory] = useState<string>(REWARD_CATEGORIES[0].id);
  const [selectedOption, setSelectedOption] = useState<RewardOption | null>(null);
  
  const [phoneNumber, setPhoneNumber] = useState(userProfile.phoneNumber || '');
  const [accountNumber, setAccountNumber] = useState(userProfile.accountNumber || '');
  const [bankName, setBankName] = useState(userProfile.bankName || '');
  
  const [showSuccess, setShowSuccess] = useState(false);

  const category = REWARD_CATEGORIES.find(c => c.id === activeCategory)!;
  const CategoryIcon = (Icons as any)[category.iconName];

  const handleConfirm = () => {
    if (!selectedOption) return;
    
    const details: any = {};
    if (activeCategory === 'airtime' || activeCategory === 'data') {
      if (!phoneNumber) return; // Basic validation
      details.phoneNumber = phoneNumber;
    } else if (activeCategory === 'cash') {
      if (!accountNumber || !bankName) return;
      details.accountNumber = accountNumber;
      details.bankName = bankName;
    }
    
    redeemReward(selectedOption, details);
    
    if (activeCategory === 'raffle') {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedOption(null);
      }, 2000);
    } else {
      setSelectedOption(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="h-full flex flex-col"
    >
      <div className="p-6 pb-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rewards Store</h2>
        <p className="text-gray-500 text-sm mb-6">Spend your points on awesome rewards.</p>
        
        {/* Horizontal Category Scroll */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          {REWARD_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            const Icon = (Icons as any)[cat.iconName];
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap font-bold text-sm transition-all neo-brutalist-sm ${
                  isActive 
                    ? `${cat.color} text-brand-dark` 
                    : 'bg-white text-gray-600 border-gray-200 shadow-none hover:bg-gray-50'
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
              const canAfford = userProfile.points >= option.cost;
              return (
                <div key={option.id} className="bg-white p-5 neo-brutalist flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-brand-dark text-lg">{option.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-brand-dark font-bold bg-brand-light px-2.5 py-1 rounded-lg border-2 border-brand-dark">
                      <Coins size={16} />
                      {option.cost}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOption(option)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-colors border-2 border-brand-dark ${
                      canAfford 
                        ? 'bg-brand-dark text-white hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(30,36,45,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    }`}
                  >
                    {canAfford ? 'Redeem Now' : 'Not enough points'}
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
              className="bg-white w-full sm:w-[360px] rounded-t-[2rem] sm:rounded-[2rem] p-6 pb-safe neo-brutalist border-b-0 sm:border-b-4"
            >
              {showSuccess ? (
                <div className="py-8 flex flex-col items-center text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4"
                  >
                    <CheckCircle2 size={40} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-brand-dark mb-2">Ticket Secured!</h3>
                  <p className="text-gray-500">Good luck in the draw.</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
                  <div className={`w-16 h-16 rounded-full ${category.color} text-brand-dark flex items-center justify-center mx-auto mb-4 border-4 border-brand-dark shadow-[4px_4px_0px_0px_rgba(30,36,45,1)]`}>
                    {CategoryIcon && <CategoryIcon size={32} />}
                  </div>
                  <h3 className="text-2xl font-bold text-center text-brand-dark mb-2">Confirm Redemption</h3>
                  <p className="text-center text-gray-500 mb-6">
                    Spend <span className="font-bold text-brand-dark">{selectedOption.cost} points</span> on {selectedOption.title}?
                  </p>
                  
                  {(activeCategory === 'airtime' || activeCategory === 'data') && (
                    <div className="mb-6 space-y-2">
                      <label className="text-sm font-bold text-brand-dark">Phone Number</label>
                      <input 
                        type="tel" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 08012345678"
                        className="w-full border-2 border-brand-dark rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    </div>
                  )}

                  {activeCategory === 'cash' && (
                    <div className="mb-6 space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-brand-dark">Bank Name</label>
                        <input 
                          type="text" 
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. GTBank"
                          className="w-full border-2 border-brand-dark rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-brand-dark">Account Number</label>
                        <input 
                          type="text" 
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="10-digit account number"
                          className="w-full border-2 border-brand-dark rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button 
                      onClick={handleConfirm}
                      className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(30,36,45,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5"
                    >
                      Confirm & Redeem
                    </button>
                    <button 
                      onClick={() => setSelectedOption(null)}
                      className="w-full bg-white text-brand-dark py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors border-2 border-brand-dark"
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
    </motion.div>
  );
}

export default RewardsView;
