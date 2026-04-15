import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, ClipboardList, User, Coins, Wifi, CheckCircle2, Wallet, Layers, CreditCard, MessageSquare } from 'lucide-react';
import { doc, onSnapshot, collection, query, where, addDoc, serverTimestamp, updateDoc, increment, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

import { View, Survey, RewardOption, UserProfile, SurveySubmission, Redemption, AppNotification } from './types';
import HomeView from './views/HomeView';
import SurveysView from './views/SurveysView';
import ActiveSurveyView from './views/ActiveSurveyView';
import RewardsView from './views/RewardsView';
import ProfileView from './views/ProfileView';
import { OnboardingView } from './views/OnboardingView';
import { ProfileBuilderView } from './views/ProfileBuilderView';
import { WalletView } from './views/WalletView';
import { SplashScreen } from './components/SplashScreen';
import logo2Img from './assets/logo2.png';
import rewardsImg from './assets/rewards.png';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<View>('onboarding');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [toast, setToast] = useState<{title: string, message: string} | null>(null);

  const MOCK_UID = 'ui-demo-user-v2';

  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      // For UI-only prototype, we don't force redirection to onboarding
      // if the user is null, as we want to allow mock navigation.
      if (firebaseUser) {
        if (view === 'onboarding') setView('home');
      }
      setLoading(false);
    });

    return () => unsubAuth();
  }, [view]);

  useEffect(() => {
    const userId = user?.uid || MOCK_UID;
    const userRef = doc(db, 'users', userId);

    const unsubProfile = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
        setInitError(null);
      } else {
        try {
          const newReferralCode = userId.substring(0, 8).toUpperCase();
          await setDoc(userRef, {
            uid: userId,
            email: user?.email || 'demo@example.com',
            displayName: user?.displayName || 'Demo User',
            photoURL: user?.photoURL || '',
            berry: 1000000,
            walletBalance: 0,
            referralCode: newReferralCode,
            referralCount: 0,
            kycVerified: false,
            profileCompleted: false,
            createdAt: serverTimestamp(),
          });
        } catch (e) {
          console.error("Error creating user profile:", e);
        }
      }
    }, (err) => {
      console.error("Profile snapshot error:", err);
      // For UI-only demo, don't block the app with connection errors
      // Just log it and let the app use fallback data
      if (err.message.includes('offline') || err.message.includes('unavailable')) {
        console.warn("Firestore is unavailable, running in offline/mock mode.");
      } else {
        setInitError("Database error: " + err.message);
      }
    });

    const qSub = query(collection(db, 'surveySubmissions'), where('userId', '==', userId));
    const unsubSub = onSnapshot(qSub, (snap) => {
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as SurveySubmission)));
    }, (err) => console.error("Submissions error:", err));

    const qRed = query(collection(db, 'redemptions'), where('userId', '==', userId));
    const unsubRed = onSnapshot(qRed, (snap) => {
      setRedemptions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Redemption)));
    }, (err) => console.error("Redemptions error:", err));

    const qNotif = query(collection(db, 'notifications'), where('userId', '==', userId));
    const unsubNotif = onSnapshot(qNotif, (snap) => {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
      notifs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setNotifications(notifs);
    }, (err) => console.error("Notifications error:", err));

    return () => {
      unsubProfile();
      unsubSub();
      unsubRed();
      unsubNotif();
    };
  }, [user]);

  const startSurvey = (survey: Survey) => {
    setActiveSurvey(survey);
    setView('survey_active');
  };

  const finishSurvey = async (berryEarned: number, surveyId: string) => {
    const userId = activeProfile.uid;
    try {
      await addDoc(collection(db, 'surveySubmissions'), {
        userId,
        surveyId,
        berryEarned,
        submittedAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'users', userId), {
        berry: increment(berryEarned)
      });

      setActiveSurvey(null);
      setView('home');
      showToast('Survey Completed!', `You earned ${berryEarned} Berry.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'surveySubmissions');
    }
  };

  const redeemReward = async (option: RewardOption, details?: any) => {
    const userId = activeProfile.uid;
    if (activeProfile.berry >= option.cost) {
      try {
        if (details && Object.keys(details).length > 0) {
          await updateDoc(doc(db, 'users', userId), details);
        }

        await addDoc(collection(db, 'redemptions'), {
          userId,
          rewardId: option.id,
          rewardTitle: option.title,
          cost: option.cost,
          redeemedAt: serverTimestamp(),
          status: 'pending'
        });

        const updates: any = {
          berry: increment(-option.cost)
        };
        
        if (option.id.startsWith('c')) {
           const amount = option.id === 'c1' ? 1000 : option.id === 'c2' ? 5000 : 0;
           updates.walletBalance = increment(amount);
        }

        await updateDoc(doc(db, 'users', userId), updates);

        await addDoc(collection(db, 'notifications'), {
          userId,
          title: 'Redemption Successful',
          message: `You redeemed ${option.title} for ${option.cost} Berry.`,
          read: false,
          createdAt: serverTimestamp(),
          type: 'redemption'
        });

        showToast('Redemption Successful!', `You redeemed ${option.title}.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'redemptions');
      }
    } else {
      showToast('Not enough Berry', `You need ${option.cost - activeProfile.berry} more Berry.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white font-bold uppercase tracking-widest animate-pulse">Initializing berry...</p>
      </div>
    );
  }

  if (initError && !userProfile) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-[2rem] border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(30,36,45,1)] max-w-sm">
          <div className="w-16 h-16 bg-secondary rounded-2xl border-4 border-gray-900 flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(30,36,45,1)]">
            <Wifi size={32} className="text-gray-900" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase mb-4 leading-tight">Connection Issue</h2>
          <p className="text-gray-600 font-bold mb-8">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-secondary py-4 rounded-2xl border-4 border-gray-900 shadow-[4px_4px_0px_0px_rgba(30,36,45,1)] font-black uppercase text-gray-900 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const activeProfile = userProfile || {
    uid: user?.uid || MOCK_UID,
    email: user?.email || 'demo@example.com',
    displayName: user?.displayName || 'Demo User',
    photoURL: user?.photoURL || '',
    berry: 0,
    walletBalance: 0,
    referralCode: (user?.uid || MOCK_UID).substring(0, 8).toUpperCase(),
    createdAt: null as any
  };

  const completedSurveyIds = submissions.map(s => s.surveyId);

  return (
    <div className="min-h-screen bg-[#fbf9ee] font-sans flex flex-col relative overflow-hidden">
        
        {showSplash && (
          <div className="absolute inset-0 z-[100]">
            <SplashScreen onFinish={() => setShowSplash(false)} />
          </div>
        )}

        {view === 'onboarding' ? (
          <OnboardingView setView={setView} />
        ) : view === 'profile-builder' ? (
          <ProfileBuilderView setView={setView} userProfile={activeProfile} />
        ) : (
          <>
            {view !== 'survey_active' && (
              <header className="bg-[#fbf9ee] px-6 py-2 flex justify-between items-center z-10 relative max-w-md mx-auto w-full">
                <div className="flex items-center gap-2">
                  <img src={logo2Img} alt="berry Logo" className="w-8 h-8 rounded-lg object-contain" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">berry</h1>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Hello, {activeProfile.displayName?.split(' ')[0] || 'User'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setView('wallet')}
                    className="flex items-center gap-1 bg-white border border-gray-100 px-3 py-1.5 rounded-full text-gray-900 font-bold text-xs shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <Wallet size={14} className="text-primary" />
                    <span>₦{activeProfile.walletBalance?.toLocaleString() || '0'}</span>
                  </button>
                  <motion.div 
                    key={activeProfile.berry}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 bg-white border border-gray-100 px-3 py-1.5 rounded-full text-gray-900 font-bold text-xs shadow-sm"
                  >
                    <Coins size={14} className="text-primary" />
                    <span>{activeProfile.berry?.toLocaleString() || '0'}</span>
                  </motion.div>
                </div>
              </header>
            )}

            <main className="flex-1 overflow-y-auto relative bg-[#fbf9ee] pb-24 scrollbar-hide max-w-md mx-auto w-full">
              <AnimatePresence mode="wait">
                {view === 'home' && (
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
                    userProfile={activeProfile}
                    startSurvey={startSurvey} 
                    completedSurveys={completedSurveyIds} 
                    setView={setView}
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
                {view === 'rewards' && (
                  <RewardsView 
                    key="rewards" 
                    userProfile={activeProfile} 
                    redeemReward={redeemReward} 
                    redemptions={redemptions}
                    showToast={showToast}
                  />
                )}
                {view === 'profile' && (
                  <ProfileView 
                    key="profile" 
                    userProfile={activeProfile}
                    redemptions={redemptions}
                    submissions={submissions}
                    showToast={showToast}
                  />
                )}
              </AnimatePresence>
            </main>

            {/* Nav Bar only visible when not in onboarding/survey */}
            {view !== 'onboarding' && view !== 'survey_active' && (
              <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-2 py-1.5 flex justify-between items-center z-20 rounded-[2rem] border border-gray-50">
                <div className="flex flex-1 justify-around items-center">
                  <NavItem icon={Home} label="Home" isActive={view === 'home'} onClick={() => setView('home')} />
                  <NavItem icon={ClipboardList} label="Answer" isActive={view === 'surveys'} onClick={() => setView('surveys')} />
                </div>
                
                <ProminentNavItem isActive={view === 'rewards'} onClick={() => setView('rewards')} />
                
                <div className="flex flex-1 justify-around items-center">
                  <NavItem icon={Wallet} label="Wallet" isActive={view === 'wallet'} onClick={() => setView('wallet')} />
                  <NavItem icon={User} label="Profile" isActive={view === 'profile'} onClick={() => setView('profile')} />
                </div>
              </nav>
            )}
          </>
        )}

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 20, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white text-gray-900 p-4 rounded-2xl shadow-lg z-50 flex items-start gap-3 border border-gray-100"
            >
              <div className="bg-secondary/20 p-2 rounded-full text-primary">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">{toast.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{toast.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

    </div>
  );
}

function NavItem({ icon: Icon, label, isActive, onClick, badge }: { icon: React.ElementType, label: string, isActive: boolean, onClick: () => void, badge?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 transition-all ${isActive ? 'text-primary scale-105' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <div className="relative">
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        {badge && (
          <div className="absolute -top-1 -right-2 bg-[#E15A5A] text-white text-[7px] font-bold px-1 rounded-md min-w-[14px] h-[12px] flex items-center justify-center border border-white">
            {badge}
          </div>
        )}
      </div>
      <span className={`text-[9px] font-bold ${isActive ? 'text-primary' : 'text-gray-500'}`}>{label}</span>
    </button>
  );
}

function ProminentNavItem({ isActive, onClick }: { isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="relative -top-4 flex flex-col items-center gap-0.5 group"
    >
      <div className={`w-14 h-14 rounded-full bg-white border-2 ${isActive ? 'border-accent' : 'border-gray-100'} p-1 shadow-lg flex items-center justify-center transition-all active:scale-95 group-hover:shadow-xl`}>
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FDECF2] via-[#E0C3FC] to-[#FDECF2] flex items-center justify-center overflow-hidden relative">
           {/* Holographic effect simulation */}
           <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(circle_at_center,_#fff_0%,_transparent_70%)] animate-pulse" />
           <img 
             src={rewardsImg} 
             alt="Rewards" 
             className={`w-10 h-10 object-contain transition-all ${isActive ? 'scale-110' : 'grayscale opacity-70'}`}
           />
        </div>
      </div>
      <span className={`text-[9px] font-bold ${isActive ? 'text-primary' : 'text-gray-500'}`}>Rewards</span>
    </button>
  );
}

