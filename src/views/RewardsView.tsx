import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, CheckCircle2, Ticket, AlertCircle, Share2, Copy, ClipboardCheck, ArrowRight, Loader2, X, Sparkles, MessageCircle, Link, Globe } from 'lucide-react';
import * as Icons from 'lucide-react';
import logoImg from '../assets/logo.png';
import { RewardOption, UserProfile, Redemption, PrizeClaim } from '../types';
import { REWARD_CATEGORIES } from '../data';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface RewardsViewProps {
  userProfile: UserProfile;
  redeemReward: (opt: RewardOption, details?: any) => void;
  redemptions: Redemption[];
  showToast: (title: string, message: string, type?: 'success' | 'error') => void;
  claims: PrizeClaim[];
}

const RewardsView: React.FC<RewardsViewProps> = ({ userProfile, redeemReward, redemptions, showToast, claims }) => {
  const [activeCategory, setActiveCategory] = useState<string>(REWARD_CATEGORIES[0].id);
  const [selectedOption, setSelectedOption] = useState<RewardOption | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [raffleTicket, setRaffleTicket] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<{ticketNumber: string, drawTitle: string, date: string} | null>(null);

  // Social Claim Modal States
  const [claimStep, setClaimStep] = useState<'platform' | 'loading' | 'preview' | 'confirmed'>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'whatsapp' | null>(null);
  const [generatedPost, setGeneratedPost] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSelectPlatformNext = () => {
    if (!selectedPlatform) return;
    setClaimStep('loading');
    setTimeout(() => {
      const code = userProfile.referralCode || 'BERRY';
      let promoText = '';
      if (selectedPlatform === 'facebook') {
        promoText = `Wow! 🥳 I just won the ₦50,000 cash prize in the weekly draw on the berry app! All I did was answer fun, quick surveys on my phone. 🍓 Join berry now with my referral code ${code} and let's earn together: https://berry.app/r/${code}`;
      } else if (selectedPlatform === 'twitter') {
        promoText = `OMG! Just won ₦50,000 on the @berryApp weekly draw (Ticket #A10294) 🥳🍓! Easiest surveys ever. Download berry now! Use code: ${code} #berryApp #Surveys #Winners`;
      } else if (selectedPlatform === 'instagram') {
        promoText = `Winner details! 🥳 Won ₦50,000 on the berry app weekly raffle (Ticket: #A10294) just for answering surveys. Download berry now to start earning real rewards! 🍓 Code: ${code}`;
      } else if (selectedPlatform === 'linkedin') {
        promoText = `I am excited to share that I have been selected as the weekly raffle winner on the berry app, receiving a ₦50,000 cash prize! 🍓 berry connects brands with consumer opinions in a mutually rewarding format. Join with my code: ${code}`;
      } else {
        promoText = `Yay! 🥳 I just won ₦50,000 in the berry weekly cash draw with ticket #A10294! 🍓 Join berry now to start answering simple surveys and winning real money cash rewards. Use my referral code: ${code}\nhttps://berry.app/r/${code}`;
      }
      setGeneratedPost(promoText);
      setClaimStep('preview');
      setCopiedText(false);
    }, 1200);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopiedText(true);
    showToast('Copied!', 'Post content copied to clipboard!', 'success');
  };

  const handleMarkAsPosted = async () => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'claims'), {
        userId: userProfile.uid,
        displayName: userProfile.displayName || 'Demo User',
        ticketNumber: '#A10294',
        rewardTitle: 'Weekly Cash Draw Raffle',
        rewardId: 'r1',
        platform: selectedPlatform || 'facebook',
        postText: generatedPost,
        status: 'pending',
        claimedAt: serverTimestamp()
      });
      setClaimStep('confirmed');
      showToast('Claim Submitted!', 'Your claim has been flagged for admin verification.', 'success');
    } catch (e) {
      console.error("Failed to submit claim:", e);
      showToast('Failed to submit', 'There was an issue submitting your claim. Please retry.', 'error');
    } finally {
      setIsSubmitting(false);
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
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Rewards Store</h2>
        <p className="text-gray-500 text-sm mb-6">Spend your berries on awesome rewards.</p>
        
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
              let myTickets = redemptions.filter(r => r.rewardId === option.id);
              
              // Inject a winning ticket for 'r1' to test claiming prize
              if (option.id === 'r1' && !myTickets.some(t => t.details?.ticketNumber === '#A10294')) {
                myTickets = [{
                  id: 'mock-winner-r1',
                  userId: userProfile.uid,
                  rewardId: 'r1',
                  cost: 200,
                  details: { ticketNumber: '#A10294' },
                  redeemedAt: null
                }, ...myTickets];
              }

              // Inject mock tickets for 'r3' to demonstrate the horizontal scroll UI
              if (option.id === 'r3' && myTickets.length === 0) {
                myTickets = Array.from({ length: 12 }, (_, i) => ({
                  id: `mock-${i}`,
                  userId: userProfile.uid,
                  rewardId: 'r3',
                  cost: 100,
                  details: { ticketNumber: `#TKT-M${1000 + i}` },
                  redeemedAt: null
                }));
              }

              return (
                <div key={option.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
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
                          <div className="relative mt-2">
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide pr-8">
                              {myTickets.map((t, idx) => {
                                const tNum = t.details?.ticketNumber || `#TKT-${idx+1}`;
                                return (
                                  <button 
                                    key={idx} 
                                    onClick={() => setSelectedTicket({
                                      ticketNumber: tNum,
                                      drawTitle: option.title,
                                      date: new Date(t.redeemedAt?.toDate?.() || Date.now()).toLocaleDateString()
                                    })}
                                    className="text-xs font-mono bg-gray-50 border border-gray-200 px-3 py-1.5 rounded text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer shrink-0"
                                  >
                                    {tNum}
                                  </button>
                                );
                              })}
                            </div>
                            {myTickets.length > 3 && (
                              <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                            )}
                          </div>
                           {/* Mock Winning Ticket Logic */}
                          {option.id === 'r1' && (() => {
                            const matchingClaim = claims.find(c => c.rewardId === 'r1' && c.ticketNumber === '#A10294' && c.userId === userProfile.uid);
                            return (
                              <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-xl mt-2 text-left">
                                <p className="text-xs text-secondary font-semibold mb-1 uppercase tracking-wider">Weekly Cash Draw Winner</p>
                                <div className="flex justify-between items-center mt-1">
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">Your Ticket: #A10294</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Congrats on winning the weekly ₦50,000 draw!</p>
                                  </div>
                                  <Ticket className="text-secondary opacity-30 animate-pulse" size={24} />
                                </div>
                                
                                {matchingClaim ? (
                                  <div className="mt-3 pt-3 border-t border-secondary/10">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`w-2 h-2 rounded-full ${
                                        matchingClaim.status === 'pending' ? 'bg-amber-500 animate-ping' :
                                        matchingClaim.status === 'verified' ? 'bg-emerald-500' : 'bg-rose-500'
                                      }`} />
                                      <p className="text-[11px] font-semibold text-gray-800">
                                        Claim Status: <span className={`uppercase text-[10px] bg-white border px-1.5 py-0.5 rounded ml-1 font-bold ${
                                          matchingClaim.status === 'pending' ? 'text-amber-600 border-amber-200' :
                                          matchingClaim.status === 'verified' ? 'text-emerald-600 border-emerald-200' : 'text-rose-600 border-rose-200'
                                        }`}>{matchingClaim.status === 'pending' ? 'pending verification' : matchingClaim.status}</span>
                                      </p>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed bg-white/50 p-2.5 rounded-lg border border-secondary/5 mt-1.5">
                                      {matchingClaim.status === 'pending' && "An admin has been flagged to verify your shared post. Once verified, your ₦50,000 cash reward will be paid."}
                                      {matchingClaim.status === 'verified' && "Congratulations! Your share post was verified and ₦50,000 has been paid to your balance."}
                                      {matchingClaim.status === 'rejected' && "Your shared post could not be verified by the admin. Please try resubmitting your claim."}
                                    </p>
                                    {matchingClaim.status === 'rejected' && (
                                      <button 
                                        onClick={() => {
                                          setClaimStep('platform');
                                          setSelectedPlatform(null);
                                          setShowShareModal(true);
                                        }}
                                        className="mt-3 w-full text-xs font-bold text-white bg-primary py-2 rounded-lg hover:bg-primary/95 transition-colors shadow-sm"
                                      >
                                        Resubmit Proof
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      setClaimStep('platform');
                                      setSelectedPlatform(null);
                                      setShowShareModal(true);
                                    }}
                                    className="mt-3 w-full text-xs font-bold text-white bg-secondary py-2.5 rounded-xl hover:bg-secondary/95 transition-colors shadow-sm flex items-center justify-center gap-2"
                                  >
                                    <Share2 size={14} />
                                    Click to Claim Prize
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
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

      {/* Share Modal - Multi-step Claim Prize flow */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setShowShareModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>

              {claimStep === 'platform' && (
                <div>
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center p-1.5 mb-4 shadow-sm">
                    <img src={logoImg} alt="berry logo" className="w-9 h-9 object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Claim Your Prize</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Winner Ticket: <span className="font-mono font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded border">#A10294</span> • Prize: <span className="font-bold text-emerald-600">₦50,000</span>
                  </p>
                  
                  <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                    To claim your weekly cash raffle prize, please help us spread the word! Share your winning moment on any of the supported social media platforms below to instantly unlock admin payout verification.
                  </p>

                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                    Select Social Platform
                  </label>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { id: 'facebook', label: 'Facebook', color: 'hover:border-blue-500 hover:bg-blue-50/50', icon: 'Facebook', activeColor: 'border-blue-500 bg-blue-50 text-blue-600' },
                      { id: 'instagram', label: 'Instagram', color: 'hover:border-pink-500 hover:bg-pink-50/50', icon: 'Instagram', activeColor: 'border-pink-500 bg-pink-50 text-pink-600' },
                      { id: 'twitter', label: 'X / Twitter', color: 'hover:border-gray-900 hover:bg-gray-50', icon: 'Twitter', activeColor: 'border-gray-900 bg-gray-100 text-gray-900' },
                      { id: 'linkedin', label: 'LinkedIn', color: 'hover:border-indigo-600 hover:bg-indigo-50/50', icon: 'Linkedin', activeColor: 'border-indigo-600 bg-indigo-50 text-indigo-700' },
                    ].map(plat => {
                      const isSelected = selectedPlatform === plat.id;
                      const IconComponent = (Icons as any)[plat.icon];
                      return (
                        <button
                          key={plat.id}
                          onClick={() => setSelectedPlatform(plat.id as any)}
                          className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left text-sm font-medium transition-all ${
                            isSelected 
                              ? plat.activeColor + ' ring-2 ring-offset-2 ring-primary/20 scale-[0.98]' 
                              : 'border-gray-200 text-gray-700 bg-white ' + plat.color
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white' : 'bg-gray-50'}`}>
                            {IconComponent && <IconComponent size={16} />}
                          </div>
                          <span>{plat.label}</span>
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setSelectedPlatform('whatsapp')}
                      className={`col-span-2 flex items-center gap-3 p-3.5 rounded-2xl border text-left text-sm font-medium transition-all ${
                        selectedPlatform === 'whatsapp'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-offset-2 ring-emerald-100'
                          : 'border-gray-200 text-gray-700 bg-white hover:border-emerald-500 hover:bg-emerald-50/50'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${selectedPlatform === 'whatsapp' ? 'bg-white' : 'bg-gray-50'}`}>
                        <MessageCircle size={18} className="text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-xs">WhatsApp Status / Chat</p>
                        <p className="text-[10px] text-gray-400 font-normal">Perfect for sharing inside groups</p>
                      </div>
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowShareModal(false)}
                      className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
                    >
                      Later
                    </button>
                    <button 
                      disabled={!selectedPlatform}
                      onClick={handleSelectPlatformNext}
                      className="flex-1 py-3 text-sm font-semibold text-white bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/95 rounded-2xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Generate Post</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {claimStep === 'loading' && (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping scale-150 opacity-40" />
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary relative">
                      <Loader2 size={32} className="animate-spin" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Generating Verification Post</h4>
                  <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">
                    Personalizing reward details and referral integrations using AI keywords...
                  </p>
                </div>
              )}

              {claimStep === 'preview' && (
                <div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Copy Your Share Post</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Sharing to <span className="font-bold text-gray-700 capitalize">{selectedPlatform}</span>
                  </p>

                  <div className="relative mb-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-left">
                    <textarea 
                      readOnly
                      value={generatedPost}
                      rows={5}
                      className="w-full text-xs font-medium text-gray-700 bg-transparent border-0 outline-none resize-none focus:ring-0 leading-relaxed font-sans"
                    />
                    <div className="absolute right-2 bottom-2">
                      <button
                        onClick={handleCopyText}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                          copiedText 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-white text-gray-700 hover:bg-gray-100 border'
                        }`}
                      >
                        {copiedText ? <ClipboardCheck size={14} /> : <Copy size={13} />}
                        <span>{copiedText ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50 text-left mb-6">
                    <p className="text-[11px] font-medium text-amber-800 leading-relaxed flex items-start gap-1.5">
                      <AlertCircle size={13} className="shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        <strong>Verification Guide:</strong> Click "Copy", open your chosen app, create a new post, paste the generated text, and share it. Once shared, return here and mark as posted.
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setClaimStep('platform')}
                      className="py-3 px-4 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      disabled={isSubmitting}
                      onClick={handleMarkAsPosted}
                      className="flex-1 py-3 text-sm font-bold text-white bg-secondary hover:bg-secondary/95 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-2xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Mark as Posted</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {claimStep === 'confirmed' && (
                <div className="py-4 text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Sparkles size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Claim Submitted!</h3>
                  <p className="text-xs text-emerald-600 font-semibold mb-4 bg-emerald-50 w-fit mx-auto px-2.5 py-1 rounded-full border border-emerald-100">
                    Raffle: Weekly Cash Draw #A10294
                  </p>
                  
                  <p className="text-xs text-gray-600 max-w-[320px] mx-auto leading-relaxed mb-6">
                    Your social verification claim was submitted! An admin will review the shared post. Upon confirmation (typically within 1-2 hours), your <strong>₦50,000</strong> prize will be paid instantly to your wallet.
                  </p>

                  <button 
                    onClick={() => {
                      setShowShareModal(false);
                      setClaimStep('platform');
                    }}
                    className="w-full py-3.5 font-bold text-white bg-primary hover:bg-primary/95 rounded-2xl transition-colors shadow-sm"
                  >
                    Awesome, thanks!
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default RewardsView;
