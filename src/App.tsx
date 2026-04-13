import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, ClipboardList, Gift, User, Coins, Wifi, CheckCircle2, BrainCircuit, Wallet } from 'lucide-react';
import { doc, onSnapshot, collection, query, where, addDoc, serverTimestamp, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

import { View, Survey, RewardOption, UserProfile, SurveySubmission, Redemption, AppNotification } from './types';
import HomeView from './views/HomeView';
import SurveysView from './views/SurveysView';
import ActiveSurveyView from './views/ActiveSurveyView';
import RewardsView from './views/RewardsView';
import ProfileView from './views/ProfileView';
import { OnboardingView } from './views/OnboardingView';
import { ProfileBuilderView } from './views/ProfileBuilderView';
import { WalletView } from './views/WalletView';

// Helper to get or create a persistent user ID
const getPersistentUserId = () => {
  let id = localStorage.getItem('rivabit_user_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('rivabit_user_id', id);
  }
  return id;
};

export default function App() {
  const [view, setView] = useState<View>('onboarding');
  const [userId] = useState(getPersistentUserId());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [toast, setToast] = useState<{title: string, message: string} | null>(null);

  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading && !userProfile) {
        console.warn("Initialization timed out after 15s");
        setLoading(false);
      }
    }, 15000);

    let unsubProfile: () => void;
    let unsubSub: () => void;
    let unsubRed: () => void;
    let unsubNotif: () => void;

    const userRef = doc(db, 'users', userId);

    const initializeData = async () => {
      try {
        // Listen to User Profile - Attach immediately
        unsubProfile = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
            setLoading(false);
            setInitError(null);
          } else {
            // Document doesn't exist, create it
            try {
              const newReferralCode = userId.substring(0, 8).toUpperCase();
              await setDoc(userRef, {
                uid: userId,
                email: '',
                displayName: 'Guest User',
                photoURL: '',
                bits: 1000000,
                walletBalance: 0,
                referralCode: newReferralCode,
                createdAt: serverTimestamp(),
              });
            } catch (e) {
              console.error("Error creating user profile:", e);
              setLoading(false);
            }
          }
        }, (err) => {
          console.error("Profile snapshot error:", err);
          setLoading(false);
        });

        // Listen to Submissions
        const qSub = query(collection(db, 'surveySubmissions'), where('userId', '==', userId));
        unsubSub = onSnapshot(qSub, (snap) => {
          setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as SurveySubmission)));
        }, (err) => console.error("Submissions error:", err));

        // Listen to Redemptions
        const qRed = query(collection(db, 'redemptions'), where('userId', '==', userId));
        unsubRed = onSnapshot(qRed, (snap) => {
          setRedemptions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Redemption)));
        }, (err) => console.error("Redemptions error:", err));

        // Listen to Notifications
        const qNotif = query(collection(db, 'notifications'), where('userId', '==', userId));
        unsubNotif = onSnapshot(qNotif, (snap) => {
          const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
          notifs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
          setNotifications(notifs);
        }, (err) => console.error("Notifications error:", err));

      } catch (err) {
        console.error("Initialization error:", err);
        setLoading(false);
      }
    };

    initializeData();

    return () => {
      clearTimeout(timeoutId);
      if (unsubProfile) unsubProfile();
      if (unsubSub) unsubSub();
      if (unsubRed) unsubRed();
      if (unsubNotif) unsubNotif();
    };
  }, [userId]);

  const startSurvey = (survey: Survey) => {
    setActiveSurvey(survey);
    setView('survey_active');
  };

  const finishSurvey = async (bitsEarned: number, surveyId: string) => {
    if (!userProfile) return;
    try {
      // Create submission
      await addDoc(collection(db, 'surveySubmissions'), {
        userId: userId,
        surveyId,
        bitsEarned,
        submittedAt: serverTimestamp()
      });

      // Update user bits
      await updateDoc(doc(db, 'users', userId), {
        bits: increment(bitsEarned)
      });

      setActiveSurvey(null);
      setView('home');
      showToast('Survey Completed!', `You earned ${bitsEarned} Bits.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'surveySubmissions');
    }
  };

  const redeemReward = async (option: RewardOption, details?: any) => {
    if (!userProfile) return;
    if (userProfile.bits >= option.cost) {
      try {
        // Update user profile with new details if provided
        if (details && Object.keys(details).length > 0) {
          await updateDoc(doc(db, 'users', userId), details);
        }

        // Create redemption record
        await addDoc(collection(db, 'redemptions'), {
          userId: userId,
          rewardId: option.id,
          rewardTitle: option.title,
          cost: option.cost,
          redeemedAt: serverTimestamp(),
          status: 'pending' // or completed
        });

        // Deduct bits and add to wallet if cash
        const updates: any = {
          bits: increment(-option.cost)
        };
        
        // If it's a cash reward, add to wallet balance
        if (option.id.startsWith('c')) {
           // Extract amount from title or cost. Let's say cost 1100 = 1000 cash.
           // Or just hardcode based on option.id for mock
           const amount = option.id === 'c1' ? 1000 : option.id === 'c2' ? 5000 : 0;
           updates.walletBalance = increment(amount);
        }

        await updateDoc(doc(db, 'users', userId), updates);

        // Add notification
        await addDoc(collection(db, 'notifications'), {
          userId: userId,
          title: 'Redemption Successful',
          message: `You redeemed ${option.title} for ${option.cost} Bits.`,
          read: false,
          createdAt: serverTimestamp(),
          type: 'redemption'
        });

        showToast('Redemption Successful!', `You redeemed ${option.title}.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'redemptions');
      }
    } else {
      showToast('Not enough Bits', `You need ${option.cost - userProfile.bits} more Bits.`);
    }
  };

  const markNotificationsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      if (n.id) {
        try {
          await updateDoc(doc(db, 'notifications', n.id), { read: true });
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  if (loading && !userProfile) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-[#FFC900] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white font-bold uppercase tracking-widest animate-pulse">Initializing Rivabit...</p>
      </div>
    );
  }

  if (initError && !userProfile) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-[2rem] border-4 border-brand-dark shadow-[8px_8px_0px_0px_rgba(30,36,45,1)] max-w-sm">
          <div className="w-16 h-16 bg-[#FF90E8] rounded-2xl border-4 border-brand-dark flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(30,36,45,1)]">
            <Wifi size={32} className="text-brand-dark" />
          </div>
          <h2 className="text-2xl font-black text-brand-dark uppercase mb-4 leading-tight">Connection Issue</h2>
          <p className="text-gray-600 font-bold mb-8">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-[#FFC900] py-4 rounded-2xl border-4 border-brand-dark shadow-[4px_4px_0px_0px_rgba(30,36,45,1)] font-black uppercase text-brand-dark hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Fallback profile if still loading but we want to show the home page
  const activeProfile = userProfile || {
    uid: userId,
    email: '',
    displayName: 'Guest User',
    photoURL: '',
    bits: 0,
    walletBalance: 0,
    referralCode: userId.substring(0, 8).toUpperCase(),
    createdAt: null as any
  };

  const completedSurveyIds = submissions.map(s => s.surveyId);

  if (view === 'onboarding') {
    return <OnboardingView setView={setView} />;
  }

  if (view === 'profile-builder') {
    return <ProfileBuilderView setView={setView} />;
  }

  return (
    <div className="min-h-screen bg-[#E5E9E4] flex items-center justify-center sm:p-8 font-sans">
      <div className="w-full max-w-md h-[100dvh] sm:h-[850px] bg-[#F5F5F5] sm:rounded-[3rem] sm:shadow-2xl overflow-hidden relative flex flex-col">
        
        <div className="hidden sm:flex justify-between items-center px-6 py-3 bg-[#F5F5F5] text-xs font-medium text-gray-800 z-50">
          <span>9:41</span>
          <div className="flex items-center gap-2">
            <Wifi size={14} />
            <div className="w-5 h-3 bg-gray-800 rounded-sm relative">
              <div className="absolute right-0.5 top-0.5 bottom-0.5 left-0.5 bg-white rounded-[1px]"></div>
            </div>
          </div>
        </div>

        <>
          {view !== 'survey_active' && activeProfile && (
            <header className="bg-[#F5F5F5] px-6 py-4 flex justify-between items-center z-10 relative">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#1F2937] rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Rivabit</h1>
                    <p className="text-sm text-gray-500">Hello, {activeProfile.displayName?.split(' ')[0] || 'User'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setView('wallet')}
                    className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full text-gray-900 font-medium shadow-sm hover:bg-gray-200 transition-colors"
                  >
                    <Wallet size={18} />
                    <span>₦{activeProfile.walletBalance?.toLocaleString() || '0'}</span>
                  </button>
                  <motion.div 
                    key={activeProfile.bits}
                    initial={{ scale: 1.1, color: '#10b981' }}
                    animate={{ scale: 1, color: '#111827' }}
                    className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full text-gray-900 font-medium shadow-sm"
                  >
                    <Coins size={18} className="text-[#1F2937]" />
                    <span>{activeProfile.bits?.toLocaleString() || '0'}</span>
                  </motion.div>
                </div>
              </header>
            )}

            <main className="flex-1 overflow-y-auto relative bg-[#F5F5F5] pb-24">
              <AnimatePresence mode="wait">
                {view === 'home' && activeProfile && (
                  <HomeView 
                    key="home" 
                    userProfile={activeProfile}
                    startSurvey={startSurvey} 
                    completedSurveys={completedSurveyIds}
                    setView={setView}
                  />
                )}
                {view === 'surveys' && (
                  <SurveysView 
                    key="surveys" 
                    startSurvey={startSurvey} 
                    completedSurveys={completedSurveyIds} 
                  />
                )}
                {view === 'wallet' && (
                  <WalletView 
                    key="wallet" 
                    userProfile={activeProfile}
                    setUserProfile={setUserProfile as any}
                  />
                )}
                {view === 'survey_active' && activeSurvey && (
                  <ActiveSurveyView 
                    key="survey_active" 
                    survey={activeSurvey} 
                    onFinish={finishSurvey} 
                    onCancel={() => setView('home')} 
                  />
                )}
                {view === 'rewards' && activeProfile && (
                  <RewardsView 
                    key="rewards" 
                    userProfile={activeProfile} 
                    redeemReward={redeemReward} 
                    redemptions={redemptions}
                  />
                )}
                {view === 'profile' && activeProfile && (
                  <ProfileView 
                    key="profile" 
                    userProfile={activeProfile}
                    redemptions={redemptions}
                    submissions={submissions}
                  />
                )}
              </AnimatePresence>
            </main>

            {view !== 'survey_active' && (
              <nav className="absolute bottom-0 w-full bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-2 py-4 pb-safe flex justify-between items-center z-20 rounded-t-3xl">
                <NavItem icon={Home} label="Home" isActive={view === 'home'} onClick={() => setView('home')} />
                <NavItem icon={ClipboardList} label="Answer" isActive={view === 'surveys'} onClick={() => setView('surveys')} />
                <NavItem icon={Gift} label="Rewards" isActive={view === 'rewards'} onClick={() => setView('rewards')} />
                <NavItem icon={User} label="Profile" isActive={view === 'profile'} onClick={() => setView('profile')} />
              </nav>
            )}
          </>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 20, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="absolute top-0 left-4 right-4 bg-white text-gray-900 p-4 rounded-2xl shadow-lg z-50 flex items-start gap-3 border border-gray-100"
            >
              <div className="bg-gray-100 p-2 rounded-full text-[#1F2937]">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="font-medium text-sm">{toast.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{toast.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, isActive, onClick }: { icon: React.ElementType, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-14 gap-1 transition-colors ${isActive ? 'text-[#1F2937]' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <div className="relative">
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        {isActive && (
          <motion.div 
            layoutId="nav-indicator"
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1F2937] rounded-full"
          />
        )}
      </div>
      <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-[#1F2937]' : ''}`}>{label}</span>
    </button>
  );
}

