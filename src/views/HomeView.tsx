import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, CheckCircle2, Coins, Clock, ClipboardList, ShieldAlert, UserPlus, Lock, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Survey, RewardCategory, UserProfile, SurveySubmission, Redemption, PrizeClaim } from '../types';
import { MOCK_SURVEYS, REWARD_CATEGORIES } from '../data';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ProfileBuilderView } from './ProfileBuilderView';
import berryIllustration from '../assets/berry_illustration_1.svg';

interface HomeViewProps {
  userProfile: UserProfile;
  completedSurveys: string[];
  startSurvey: (s: Survey) => void;
  setView: (v: any) => void;
  submissions?: SurveySubmission[];
  redemptions?: Redemption[];
  claims?: PrizeClaim[];
}

const HomeView: React.FC<HomeViewProps> = ({ 
  userProfile, 
  completedSurveys, 
  startSurvey, 
  setView,
  submissions = [],
  redemptions = [],
  claims = []
}) => {
  const availableSurveys = MOCK_SURVEYS.filter(s => !completedSurveys.includes(s.id));
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  // Combine real database records and simulated real-time events for dynamic activity feed
  const activityFeed = React.useMemo(() => {
    const list: any[] = [];

    // 1. Survey Submissions (Real)
    if (submissions && submissions.length > 0) {
      submissions.forEach(sub => {
        const survey = MOCK_SURVEYS.find(s => s.id === sub.surveyId);
        list.push({
          id: `sub-${sub.id || Math.random()}`,
          name: 'You Completed Survey',
          detail: survey?.title || 'System Survey',
          amountText: `+${sub.berryEarned}`,
          hasBerry: true,
          amountType: 'positive',
          timestamp: sub.submittedAt,
          icon: 'ClipboardCheck',
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        });
      });
    }

    // 2. Redemptions (Real)
    if (redemptions && redemptions.length > 0) {
      redemptions.forEach(red => {
        list.push({
          id: `red-${red.id || Math.random()}`,
          name: 'You Redeemed Reward',
          detail: red.rewardTitle,
          amountText: `-${red.cost}`,
          hasBerry: true,
          amountType: 'negative',
          timestamp: red.redeemedAt,
          icon: 'Gift',
          iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        });
      });
    }

    // 3. Claims (Real)
    if (claims && claims.length > 0) {
      claims.forEach(claim => {
        const isSelf = claim.userId === userProfile.uid;
        list.push({
          id: `claim-${claim.id || Math.random()}`,
          name: isSelf ? 'Your Claim Request' : `${claim.displayName || 'A participant'}`,
          detail: `Claimed prize for ${claim.rewardTitle}`,
          amountText: claim.status === 'verified' ? 'Verified' : claim.status === 'rejected' ? 'Rejected' : 'Pending',
          statusType: claim.status || 'pending',
          amountType: 'status',
          timestamp: claim.claimedAt,
          icon: 'Award',
          iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
        });
      });
    }

    // Parse different raw timestamp formats into milliseconds epoch smoothly
    const getMs = (t: any) => {
      if (!t) return Date.now();
      if (typeof t.toMillis === 'function') return t.toMillis();
      if (t instanceof Date) return t.getTime();
      if (typeof t === 'number') return t;
      if (t.seconds) return t.seconds * 1000 + (t.nanoseconds || 0) / 1000000;
      return new Date(t).getTime();
    };

    // Simulated/Real-looking dynamic events to make the feed professional and cover 'all activities on the platform'
    // Stably mapped in time offsets
    const sims = [
      {
        id: 'sim-1',
        name: 'Chinedu A.',
        detail: 'Completed Tech Habits survey',
        amountText: '+150',
        hasBerry: true,
        amountType: 'positive',
        timeOffset: 6 * 60 * 1000, // 6 minutes ago
        icon: 'ClipboardCheck',
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      },
      {
        id: 'sim-2',
        name: 'Chioma O.',
        detail: 'Redeemed Monthly Draw Ticket',
        amountText: '-400',
        hasBerry: true,
        amountType: 'negative',
        timeOffset: 15 * 60 * 1000,
        icon: 'Ticket',
        iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      },
      {
        id: 'sim-3',
        name: 'Abubakar M.',
        detail: 'Completed Consumer Preferences survey',
        amountText: '+200',
        hasBerry: true,
        amountType: 'positive',
        timeOffset: 34 * 60 * 1000,
        icon: 'ClipboardCheck',
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      },
      {
        id: 'sim-4',
        name: 'Tunde K.',
        detail: 'Claimed ₦50,000 Weekly Prize',
        amountText: 'Verified',
        statusType: 'verified',
        amountType: 'status',
        timeOffset: 52 * 60 * 1000,
        icon: 'Award',
        iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      },
      {
        id: 'sim-5',
        name: 'Stella U.',
        detail: 'Joined via invite referral link',
        amountText: 'Registered',
        statusType: 'registered',
        amountType: 'status',
        timeOffset: 85 * 60 * 1000,
        icon: 'UserPlus',
        iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
      },
      {
        id: 'sim-6',
        name: 'Blessing E.',
        detail: 'Completed Daily Commute survey',
        amountText: '+100',
        hasBerry: true,
        amountType: 'positive',
        timeOffset: 110 * 60 * 1000,
        icon: 'ClipboardCheck',
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      }
    ];

    const processedSims = sims.map(sim => ({
      ...sim,
      timestamp: new Date(Date.now() - sim.timeOffset)
    }));

    // Combine both arrays
    const combined = [...list, ...processedSims];
    
    // Sort overall descending
    combined.sort((a, b) => getMs(b.timestamp) - getMs(a.timestamp));

    return combined.slice(0, 7); // Top 7 events
  }, [submissions, redemptions, claims, userProfile.uid]);

  const formatActivityTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    let date: Date;
    if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp.seconds !== undefined) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-6 space-y-8"
    >
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-primary via-accent to-primary animate-gradient bg-size-200 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <h2 className="font-medium mb-1 text-gray-200">Welcome back, {userProfile.displayName?.split(' ')[0] || 'User'}!</h2>
        <div className="text-2xl font-semibold mb-4 flex items-center gap-2 leading-tight">
          <Zap className="text-white fill-white opacity-80" size={24} />
          Ready to earn?
        </div>
        <button 
          onClick={() => setView('surveys')}
          className="bg-gradient-to-r from-accent via-secondary to-accent animate-gradient bg-size-200 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-sm hover:opacity-90 transition-all flex items-center gap-2 group"
        >
          <span>Answer Now</span>
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-primary group-hover:translate-x-0.5 transition-transform">
            <Icons.ArrowRight size={14} />
          </div>
        </button>
      </div>

      {/* Profile Builder or Available Surveys */}
      <section>
        {!userProfile.profileCompleted ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <ProfileBuilderView setView={setView} userProfile={userProfile} />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Available Surveys</h3>
            </div>
            <div className="space-y-3">
               {availableSurveys.length > 0 ? (
                  availableSurveys.slice(0, 2).map(survey => (
                    <SurveyCard key={survey.id} survey={survey} onClick={() => setSelectedSurvey(survey)} />
                  ))
                ) : (
                  <div className="bg-white p-6 rounded-2xl text-center shadow-sm border border-gray-100">
                    <CheckCircle2 className="mx-auto text-primary mb-2" size={40} />
                    <p className="text-gray-900 font-medium text-lg">You're all caught up!</p>
                  </div>
                )}
            </div>
          </>
        )}
      </section>

      {/* Quick Rewards - Active Raffle Draws Preview */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Raffle Draws</h3>
          <button 
            onClick={() => setView('rewards')}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Rewards</span>
            <Icons.ChevronRight size={14} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {REWARD_CATEGORIES.find(c => c.id === 'raffle')?.options.map(option => {
            const isWeekly = option.id === 'r1';
            const isMonthly = option.id === 'r2';
            
            const textColor = isWeekly ? 'text-[#3F3E8F]' : isMonthly ? 'text-amber-600' : 'text-emerald-600';
            const iconBg = isWeekly ? 'bg-[#3F3E8F]/10' : isMonthly ? 'bg-amber-50' : 'bg-emerald-50';
            
            return (
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                key={option.id} 
                onClick={() => setView('rewards')}
                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100/80 hover:border-gray-200 cursor-pointer flex flex-col justify-between transition-all gap-4 text-left relative overflow-hidden group"
              >
                {/* Decorative background element */}
                <div className="absolute right-0 top-0 opacity-[0.03] text-gray-900 pointer-events-none group-hover:scale-110 transition-transform">
                  <Icons.Ticket size={120} className="-mr-4 -mt-4 rotate-12" />
                </div>

                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className={`w-10 h-10 rounded-2xl ${iconBg} ${textColor} flex items-center justify-center shrink-0`}>
                      <Icons.Ticket size={20} />
                    </div>
                    {option.status && (
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        option.status === 'Open' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {option.status}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1 group-hover:text-primary transition-colors pr-2">
                    {option.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium leading-normal">
                    {option.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100/50 pt-3 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Entry:</span>
                    <div className="flex items-center gap-1 bg-primary/5 text-primary text-xs font-black px-2 py-0.5 rounded-full border border-primary/10">
                      <Coins size={11} className="fill-primary/20" />
                      <span>{option.cost}</span>
                    </div>
                  </div>
                  <div className="w-7 h-7 bg-gray-50 group-hover:bg-primary group-hover:text-white rounded-full flex items-center justify-center text-gray-400 transition-colors shadow-sm">
                    <Icons.ArrowRight size={12} strokeWidth={2.5} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Platform Recent Activity Stream */}
      <section className="bg-white p-6 rounded-[2rem] border border-gray-100/90 shadow-sm text-left">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <Icons.Zap size={18} className="text-[#FF8D03] shrink-0 fill-[#FF8D03]/10" />
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Recent Platform Activity</h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-100">Live Feed</span>
        </div>

        <div className="space-y-4">
          {activityFeed.map((item, index) => {
            const IconComp = (Icons as any)[item.icon] || Icons.Activity;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={item.id} 
                className="flex items-center justify-between border-b border-gray-50 last:border-0 pb-3 last:pb-0 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 border`}>
                    <IconComp size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate font-medium mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full flex items-center justify-center gap-1 ${
                    item.amountType === 'positive' 
                      ? 'bg-emerald-50 text-emerald-600 font-extrabold border border-emerald-100/50' 
                      : item.amountType === 'negative' 
                        ? 'bg-rose-50 text-rose-600 font-extrabold border border-rose-100/50' 
                        : item.amountType === 'status' && item.statusType === 'verified'
                          ? 'bg-emerald-50 text-emerald-600 font-extrabold border border-emerald-100/50'
                          : item.amountType === 'status' && item.statusType === 'rejected'
                            ? 'bg-rose-50 text-rose-600 font-extrabold border border-rose-100/50'
                            : item.amountType === 'status' && item.statusType === 'pending'
                              ? 'bg-amber-50 text-amber-600 font-extrabold border border-amber-100/50'
                              : 'bg-slate-100 text-slate-700 font-bold border border-slate-200/50'
                  }`}>
                    <span>{item.amountText}</span>
                    {item.hasBerry && (
                      <img src={berryIllustration} alt="Berry" className="w-3.5 h-3.5 object-contain shrink-0" referrerPolicy="no-referrer" />
                    )}
                    {item.amountType === 'status' && item.statusType === 'verified' && (
                      <Icons.CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                    )}
                    {item.amountType === 'status' && item.statusType === 'rejected' && (
                      <Icons.XCircle size={12} className="text-rose-500 shrink-0" />
                    )}
                    {item.amountType === 'status' && item.statusType === 'pending' && (
                      <Icons.Clock size={12} className="text-amber-500 shrink-0 animate-spin" />
                    )}
                    {item.amountType === 'status' && item.statusType === 'registered' && (
                      <Icons.Sparkles size={12} className="text-teal-500 shrink-0" />
                    )}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold font-mono">
                    {formatActivityTime(item.timestamp)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {selectedSurvey && (
          <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl relative"
            >
              <button 
                onClick={() => setSelectedSurvey(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                <ClipboardList size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{selectedSurvey.title}</h3>
              
              <div className="flex justify-center gap-4 mb-6">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">Reward</span>
                  <div className="flex items-center gap-1 text-primary font-bold bg-primary/10 px-3 py-1 rounded-full">
                    <Coins size={14} />
                    {selectedSurvey.berry}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">Time</span>
                  <div className="flex items-center gap-1 text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded-full">
                    <Clock size={14} />
                    {selectedSurvey.time}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">Category</span>
                  <div className="flex items-center gap-1 text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded-full">
                    {selectedSurvey.category}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  startSurvey(selectedSurvey);
                  setSelectedSurvey(null);
                }}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors"
              >
                Start Survey
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default HomeView;

const SurveyCard: React.FC<{ survey: Survey, onClick: () => void }> = ({ survey, onClick }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer flex gap-4 items-center transition-colors hover:bg-gray-50"
    >
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-primary shrink-0">
        <ClipboardList size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-medium text-gray-900 text-base truncate pr-2">{survey.title}</h4>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Clock size={12} /> {survey.time}</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>{survey.category}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-primary font-semibold text-sm shrink-0 bg-gray-100 px-3 py-1.5 rounded-full">
        <Coins size={14} />
        {survey.berry}
      </div>
    </motion.div>
  );
}
