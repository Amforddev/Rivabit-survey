import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Coins, Trophy, ChevronRight, LogOut, Copy, CheckCircle2, History, Gift } from 'lucide-react';
import { UserProfile, Redemption, SurveySubmission } from '../types';
import { logOut } from '../firebase';

interface ProfileViewProps {
  userProfile: UserProfile;
  redemptions: Redemption[];
  submissions: SurveySubmission[];
}

const ProfileView: React.FC<ProfileViewProps> = ({ userProfile, redemptions, submissions }) => {
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState<'none' | 'surveys' | 'redemptions'>('none');

  const copyReferral = () => {
    navigator.clipboard.writeText(userProfile.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await logOut();
  };

  if (showHistory !== 'none') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="h-full flex flex-col bg-gray-50"
      >
        <div className="bg-white px-6 py-4 flex items-center gap-4 border-b-4 border-brand-dark shadow-sm z-10">
          <button onClick={() => setShowHistory('none')} className="p-2 -ml-2 text-brand-dark hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <h2 className="text-xl font-bold text-brand-dark uppercase tracking-wide">
            {showHistory === 'surveys' ? 'Survey History' : 'Redemption History'}
          </h2>
        </div>
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {showHistory === 'surveys' && (
            submissions.length > 0 ? submissions.map(sub => (
              <div key={sub.id} className="bg-white p-5 rounded-2xl neo-brutalist flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-brand-dark text-lg">Survey Completed</h4>
                  <p className="text-sm text-gray-500 mt-1 font-bold uppercase tracking-wide">{new Date(sub.submittedAt?.toDate() || Date.now()).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 text-brand-dark font-bold bg-[#FFC900] px-3 py-1.5 rounded-lg border-2 border-brand-dark">
                  +{sub.pointsEarned} pts
                </div>
              </div>
            )) : <p className="text-gray-500 text-center py-8 font-bold text-lg">No surveys completed yet.</p>
          )}

          {showHistory === 'redemptions' && (
            redemptions.length > 0 ? redemptions.map(red => (
              <div key={red.id} className="bg-white p-5 rounded-2xl neo-brutalist flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-brand-dark text-lg">{red.rewardTitle}</h4>
                  <p className="text-sm text-gray-500 mt-1 font-bold uppercase tracking-wide">{new Date(red.redeemedAt?.toDate() || Date.now()).toLocaleDateString()} • {red.status}</p>
                </div>
                <div className="flex items-center gap-1 text-brand-dark font-bold bg-[#FF90E8] px-3 py-1.5 rounded-lg border-2 border-brand-dark">
                  -{red.cost} pts
                </div>
              </div>
            )) : <p className="text-gray-500 text-center py-8 font-bold text-lg">No redemptions yet.</p>
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
      <div className="flex flex-col items-center pt-8 pb-4">
        <div className="w-28 h-28 bg-[#FFC900] rounded-full p-1 mb-4 border-4 border-brand-dark shadow-[4px_4px_0px_0px_rgba(30,36,45,1)]">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-brand-dark">
            {userProfile.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={48} className="text-gray-300" />
            )}
          </div>
        </div>
        <h2 className="text-3xl font-bold text-brand-dark">{userProfile.displayName || 'User'}</h2>
        <p className="text-gray-500 font-bold">{userProfile.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl neo-brutalist flex flex-col items-center">
          <Coins className="text-[#FFC900] mb-2" size={32} />
          <span className="text-3xl font-bold text-brand-dark">{userProfile.points}</span>
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Total Points</span>
        </div>
        <div className="bg-white p-5 rounded-2xl neo-brutalist flex flex-col items-center">
          <Trophy className="text-[#23A094] mb-2" size={32} />
          <span className="text-3xl font-bold text-brand-dark">{submissions.length}</span>
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Surveys Done</span>
        </div>
      </div>

      {/* Referral Section */}
      <div className="bg-[#23A094] rounded-2xl p-6 text-white neo-brutalist relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-20">
          <Gift size={120} />
        </div>
        <h3 className="font-bold text-2xl mb-1 relative z-10 text-brand-dark uppercase tracking-wide">Refer a Friend</h3>
        <p className="text-brand-dark font-bold text-sm mb-4 relative z-10">Get 50 points when they sign up!</p>
        <div className="flex items-center gap-2 relative z-10">
          <div className="bg-white text-brand-dark px-4 py-3 rounded-xl font-mono font-bold tracking-wider flex-1 text-center border-2 border-brand-dark">
            {userProfile.referralCode}
          </div>
          <button 
            onClick={copyReferral}
            className="bg-brand-dark text-white p-3 rounded-xl hover:bg-gray-800 transition-colors border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(30,36,45,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5"
          >
            {copied ? <CheckCircle2 size={24} /> : <Copy size={24} />}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl neo-brutalist overflow-hidden mt-6 flex flex-col">
        <button 
          onClick={() => setShowHistory('surveys')}
          className="w-full flex items-center justify-between p-5 border-b-2 border-brand-dark hover:bg-[#E8F0FE] transition-colors"
        >
          <div className="flex items-center gap-3">
            <History size={24} className="text-brand-dark" />
            <span className="font-bold text-brand-dark text-lg uppercase tracking-wide">Survey History</span>
          </div>
          <ChevronRight size={24} className="text-brand-dark" />
        </button>
        <button 
          onClick={() => setShowHistory('redemptions')}
          className="w-full flex items-center justify-between p-5 border-b-2 border-brand-dark hover:bg-[#E8F0FE] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Gift size={24} className="text-brand-dark" />
            <span className="font-bold text-brand-dark text-lg uppercase tracking-wide">Redemption History</span>
          </div>
          <ChevronRight size={24} className="text-brand-dark" />
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-5 hover:bg-[#FF90E8] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <LogOut size={24} className="text-brand-dark" />
            <span className="font-bold text-brand-dark text-lg uppercase tracking-wide">Log Out</span>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

export default ProfileView;
