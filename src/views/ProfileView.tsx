import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Coins, Trophy, ChevronRight, LogOut, Copy, CheckCircle2, History, Edit2, Gift, ShieldAlert, BadgeInfo, Check, X as XIcon, HelpCircle } from 'lucide-react';
import { View, UserProfile, Redemption, SurveySubmission, PrizeClaim } from '../types';
import { logOut, auth } from '../firebase';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface ProfileViewProps {
  userProfile: UserProfile;
  redemptions: Redemption[];
  submissions: SurveySubmission[];
  showToast: (title: string, message: string, type?: 'success' | 'error') => void;
  setView: (view: View) => void;
  claims: PrizeClaim[];
}

const ProfileView: React.FC<ProfileViewProps> = ({ userProfile, redemptions, submissions, showToast, setView, claims }) => {
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState<'none' | 'surveys' | 'redemptions'>('none');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(userProfile.displayName || '');
  const [showAdminPortal, setShowAdminPortal] = useState(false);

  const handleApproveClaim = async (claim: PrizeClaim) => {
    if (!claim.id) return;
    try {
      // 1. Update claim status to verified
      await updateDoc(doc(db, 'claims', claim.id), {
        status: 'verified'
      });

      // 2. Add N50,000 to user's walletBalance
      await updateDoc(doc(db, 'users', claim.userId), {
        walletBalance: increment(50000)
      });

      // 3. Create success notification for user
      await addDoc(collection(db, 'notifications'), {
        userId: claim.userId,
        title: 'Weekly Raffle Approved!',
        message: `Your share post for ticket #A10294 has been verified! ₦50,000 has been added to your Wallet balance.`,
        read: false,
        createdAt: serverTimestamp(),
        type: 'redemption'
      });

      showToast('Claim Approved!', '₦50,000 has been credited to the user.', 'success');
    } catch (e) {
      console.error("Failed to approve claim", e);
      showToast('Error', 'Failed to approve claim. Please try again.', 'error');
    }
  };

  const handleRejectClaim = async (claim: PrizeClaim) => {
    if (!claim.id) return;
    try {
      // 1. Update claim status to rejected
      await updateDoc(doc(db, 'claims', claim.id), {
        status: 'rejected'
      });

      // 2. Create notification for user
      await addDoc(collection(db, 'notifications'), {
        userId: claim.userId,
        title: 'Weekly Raffle Rejected',
        message: `We were unable to verify your shared post. Please resubmit your claim on the Rewards page.`,
        read: false,
        createdAt: serverTimestamp(),
        type: 'system'
      });

      showToast('Claim Flagged', 'Claim rejected and notification dispatched.', 'success');
    } catch (e) {
      console.error("Failed to reject claim", e);
      showToast('Error', 'Failed to reject claim.', 'error');
    }
  };

  const handleSaveName = async () => {
    if (editName.trim() && editName !== userProfile.displayName) {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid), {
          displayName: editName.trim()
        });
      } catch (e) {
        console.error("Failed to update name", e);
      }
    }
    setIsEditingName(false);
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(userProfile.referralCode);
    setCopied(true);
    showToast('Copied!', 'Referral code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        await logOut();
      }
    } catch(e) {
      console.error(e);
    }
    setView('onboarding');
  };

  const handleResetDemo = async () => {
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), {
        kycVerified: false,
        phoneVerified: false,
        profileCompleted: false,
        profileData: {}, // Clear survey/profile answers
        berry: 0,
        walletBalance: 0,
        referralCount: 0
      });
      // Clear local stored profile builder progress
      localStorage.removeItem(`profile_progress_${userProfile.uid}`);
      window.location.reload();
    } catch (e) {
      console.error("Failed to reset demo state", e);
      showToast('Error', 'Failed to reset demo state');
    }
  };

  if (showHistory !== 'none') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="h-full flex flex-col bg-gray-50"
      >
        <div className="bg-white px-6 py-4 flex items-center gap-4 border-b border-gray-100 shadow-sm z-10">
          <button onClick={() => setShowHistory('none')} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {showHistory === 'surveys' ? 'Survey History' : 'Redemption History'}
          </h2>
        </div>
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {showHistory === 'surveys' && (
            submissions.length > 0 ? submissions.map(sub => (
              <div key={sub.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900 text-base">Survey Completed</h4>
                  <p className="text-xs text-gray-500 mt-1">{new Date(sub.submittedAt?.toDate() || Date.now()).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 text-primary font-semibold bg-gray-100 px-3 py-1.5 rounded-full text-sm">
                  +{sub.berryEarned} Berry
                </div>
              </div>
            )) : <p className="text-gray-500 text-center py-8 text-sm">No surveys completed yet.</p>
          )}

          {showHistory === 'redemptions' && (
            redemptions.length > 0 ? redemptions.map(red => (
              <div key={red.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900 text-base">{red.rewardTitle}</h4>
                  <p className="text-xs text-gray-500 mt-1">{new Date(red.redeemedAt?.toDate() || Date.now()).toLocaleDateString()} • {red.status}</p>
                </div>
                <div className="flex items-center gap-1 text-gray-700 font-semibold bg-gray-100 px-3 py-1.5 rounded-full text-sm">
                  -{red.cost} Berry
                </div>
              </div>
            )) : <p className="text-gray-500 text-center py-8 text-sm">No redemptions yet.</p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col items-center pt-4 pb-2">
        <div className="w-24 h-24 bg-gray-100 rounded-full p-1 mb-3">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
            {userProfile.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={40} className="text-gray-400" />
            )}
          </div>
        </div>
        
        {isEditingName ? (
          <div className="flex items-center gap-2 mb-1">
            <input 
              type="text" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-center font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-1 cursor-pointer group" onClick={() => setIsEditingName(true)}>
            <h2 className="text-2xl font-semibold text-gray-900">{userProfile.displayName || 'User'}</h2>
            <Edit2 size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
          </div>
        )}
        
        <p className="text-gray-500 text-sm">{userProfile.email || 'Guest User'}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <Coins className="text-primary mb-1" size={24} />
          <span className="text-2xl font-semibold text-gray-900">{userProfile.berry}</span>
          <span className="text-xs text-gray-500 mt-1">Total Berry</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <Trophy className="text-primary mb-1" size={24} />
          <span className="text-2xl font-semibold text-gray-900">{userProfile.referralCount || 0}</span>
          <span className="text-xs text-gray-500 mt-1">Referrals</span>
        </div>
      </div>

      {/* Achievement Section */}
      {(userProfile.referralCount || 0) >= 5 && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden"
        >
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Trophy size={32} className="text-white fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Elite Referrer!</h3>
              <p className="text-sm text-white/90">You've referred 5+ friends. Extra rewards unlocked!</p>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </motion.div>
      )}

      {/* Referral Section matching the image */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-xl text-gray-900 mb-1">We value friendship</h3>
        <p className="text-gray-500 text-sm mb-6">Follow the steps below and get rewarded</p>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-200 mb-6">
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-200 bg-white text-gray-500 text-sm font-medium shrink-0 z-10">
              1
            </div>
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-medium text-sm">Share your code</span>
              </div>
            </div>
          </div>
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-200 bg-white text-gray-500 text-sm font-medium shrink-0 z-10">
              2
            </div>
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-2">
              <span className="text-gray-900 font-medium text-sm">Your friend signs up with your code</span>
            </div>
          </div>
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-200 bg-white text-gray-500 text-sm font-medium shrink-0 z-10">
              3
            </div>
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-2">
              <span className="text-gray-900 font-medium text-sm">They complete their profile surveys</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="mt-0.5"><Coins size={16} className="text-gray-600" /></div>
            <div>
              <p className="text-xs text-gray-500">You get</p>
              <p className="text-sm font-medium text-gray-900">500 Berries</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Gift size={16} className="text-secondary" />
            </div>
            <div>
              <p className="text-xs text-gray-500">They get</p>
              <p className="text-sm font-medium text-gray-900">200 Berries</p>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500 mb-1">Refer 5 friends and get extra rewards</p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full ${i <= (userProfile.referralCount || 0) ? 'bg-primary' : 'bg-gray-200'}`} 
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-900">{(userProfile.referralCount || 0)}/5</span>
          </div>
          {(userProfile.referralCount || 0) >= 5 && (
            <div className="flex items-center justify-center gap-1 text-sm font-medium text-secondary mt-2">
              <CheckCircle2 size={14} /> Achievement Unlocked!
            </div>
          )}
        </div>

        <div className="relative flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-900">Your Referral Code</label>
          <div className="relative flex items-center">
            <input 
              type="text" 
              readOnly 
              value={userProfile.referralCode}
              className="w-full bg-gray-50 border-2 border-primary/20 rounded-xl py-4 pl-4 pr-24 text-lg font-bold text-primary tracking-widest focus:outline-none"
            />
            <button 
              onClick={copyReferral}
              className="absolute right-2 top-2 bottom-2 bg-primary text-white px-6 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              <span className="text-sm font-bold">Copy</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6 flex flex-col">
        <button 
          onClick={() => setShowHistory('surveys')}
          className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <History size={20} className="text-gray-600" />
            <span className="font-medium text-gray-900 text-base">Survey History</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
        <button 
          onClick={() => setShowHistory('redemptions')}
          className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Gift size={20} className="text-gray-600" />
            <span className="font-medium text-gray-900 text-base">Redemption History</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <LogOut size={20} className="text-red-500" />
            <span className="font-medium text-red-500 text-base">Log Out</span>
          </div>
        </button>
      </div>

      {/* Admin Payout Claims Terminal */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAdminPortal(!showAdminPortal)}>
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-amber-500 animate-pulse" size={20} />
              <h3 className="font-semibold text-lg text-gray-900">Claims Payout Terminal</h3>
            </div>
            <p className="text-gray-500 text-xs mt-1">Review & authorize raffle winner payouts</p>
          </div>
          <div className="flex items-center gap-2">
            {claims.filter(c => c.status === 'pending').length > 0 && (
              <span className="bg-amber-500 font-bold text-white text-[10px] px-2 py-0.5 rounded-full">
                {claims.filter(c => c.status === 'pending').length} pending
              </span>
            )}
            <ChevronRight size={20} className={`text-gray-400 transition-transform ${showAdminPortal ? 'rotate-90' : ''}`} />
          </div>
        </div>

        <AnimatePresence>
          {showAdminPortal && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4 pt-4 border-t border-gray-100 space-y-4"
            >
              {claims.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed">
                  <BadgeInfo className="mx-auto text-gray-400 mb-1" size={20} />
                  <p className="text-xs text-gray-500 font-medium">No payout claims exist in the system yet.</p>
                </div>
              ) : (
                claims.map(claim => (
                  <div key={claim.id} className="bg-gray-50 border rounded-2xl p-4 text-left">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{claim.displayName}</h4>
                        <p className="text-[10px] text-gray-500">Ticket: {claim.ticketNumber} • {claim.rewardTitle}</p>
                      </div>
                      <span className={`uppercase font-bold text-[9px] px-2 py-0.5 rounded-full border ${
                        claim.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                        claim.status === 'verified' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                        'bg-red-50 border-red-200 text-red-600'
                      }`}>
                        {claim.status}
                      </span>
                    </div>

                    <div className="mt-2.5 bg-white border p-2.5 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Shared Post Proof ({claim.platform})</p>
                      <p className="text-xs text-gray-700 italic font-mono leading-relaxed bg-gray-50/50 p-2 rounded">
                        "{claim.postText}"
                      </p>
                    </div>

                    {claim.status === 'pending' ? (
                      <div className="mt-3 flex gap-2.5">
                        <button
                          onClick={() => handleRejectClaim(claim)}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center justify-center gap-1 bg-white"
                        >
                          <XIcon size={14} />
                          <span>Flag / Reject</span>
                        </button>
                        <button
                          onClick={() => handleApproveClaim(claim)}
                          className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Check size={14} />
                          <span>Pay ₦50,000</span>
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2.5 text-right">
                        <p className="text-[10px] text-gray-400 font-medium">
                          Processed • {claim.status === 'verified' ? 'Approved & Paid' : 'Flagged & Rejected'}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded-2xl border border-dashed border-gray-300">
        <p className="text-xs text-gray-500 font-mono mb-2 uppercase tracking-wider">Developer Tools</p>
        <button 
          onClick={handleResetDemo}
          className="w-full bg-white border border-gray-200 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors mb-2"
        >
          Reset Demo State (KYC & Profile)
        </button>
        <button 
          onClick={async () => {
            try {
              await updateDoc(doc(db, 'users', userProfile.uid), {
                berry: 1000000
              });
            } catch (e) {
              console.error("Failed to add berry", e);
            }
          }}
          className="w-full py-3 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          RESET TO 1,000,000 BERRY
        </button>
      </div>
    </motion.div>
  );
}

export default ProfileView;
