import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, ClipboardList, Gift, User, Coins, Wifi, CheckCircle2, Bell, BrainCircuit } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, addDoc, serverTimestamp, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

import { View, Survey, RewardOption, UserProfile, SurveySubmission, Redemption, AppNotification } from './types';
import HomeView from './views/HomeView';
import SurveysView from './views/SurveysView';
import ActiveSurveyView from './views/ActiveSurveyView';
import RewardsView from './views/RewardsView';
import ProfileView from './views/ProfileView';
import TriviaView from './views/TriviaView';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [toast, setToast] = useState<{title: string, message: string} | null>(null);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);

  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Auto sign-in failed:", error);
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    let unsubProfile: () => void;
    let unsubSub: () => void;
    let unsubRed: () => void;
    let unsubNotif: () => void;

    const initUserAndListen = async () => {
      const userRef = doc(db, 'users', user.uid);
      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          const newReferralCode = user.uid.substring(0, 6).toUpperCase() + Math.floor(Math.random() * 1000);
          await setDoc(userRef, {
            uid: user.uid,
            email: '',
            displayName: 'Guest User',
            photoURL: '',
            points: 0,
            referralCode: newReferralCode,
            createdAt: serverTimestamp(),
          });
        }
      } catch (e) {
        console.error("Error initializing user:", e);
      }

      unsubProfile = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        }
        setLoading(false);
      }, (err) => handleFirestoreError(err, OperationType.GET, 'users'));

      // Listen to Submissions
      const qSub = query(collection(db, 'surveySubmissions'), where('userId', '==', user.uid));
      unsubSub = onSnapshot(qSub, (snap) => {
        setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as SurveySubmission)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'surveySubmissions'));

      // Listen to Redemptions
      const qRed = query(collection(db, 'redemptions'), where('userId', '==', user.uid));
      unsubRed = onSnapshot(qRed, (snap) => {
        setRedemptions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Redemption)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'redemptions'));

      // Listen to Notifications
      const qNotif = query(collection(db, 'notifications'), where('userId', '==', user.uid));
      unsubNotif = onSnapshot(qNotif, (snap) => {
        const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
        // Sort by date desc
        notifs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setNotifications(notifs);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'notifications'));
    };

    initUserAndListen();

    return () => {
      if (unsubProfile) unsubProfile();
      if (unsubSub) unsubSub();
      if (unsubRed) unsubRed();
      if (unsubNotif) unsubNotif();
    };
  }, [user]);

  const startSurvey = (survey: Survey) => {
    setActiveSurvey(survey);
    setView('survey_active');
  };

  const finishSurvey = async (pointsEarned: number, surveyId: string) => {
    if (!user || !userProfile) return;
    try {
      // Create submission
      await addDoc(collection(db, 'surveySubmissions'), {
        userId: user.uid,
        surveyId,
        pointsEarned,
        submittedAt: serverTimestamp()
      });

      // Update user points
      await updateDoc(doc(db, 'users', user.uid), {
        points: increment(pointsEarned)
      });

      setActiveSurvey(null);
      setView('home');
      showToast('Survey Completed!', `You earned ${pointsEarned} points.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'surveySubmissions');
    }
  };

  const handleEarnTriviaPoints = async (pointsEarned: number) => {
    if (!user || !userProfile) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        points: increment(pointsEarned)
      });
      showToast('Trivia Completed!', `You earned ${pointsEarned} points.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    }
  };

  const redeemReward = async (option: RewardOption, details?: any) => {
    if (!user || !userProfile) return;
    if (userProfile.points >= option.cost) {
      try {
        // Update user profile with new details if provided
        if (details && Object.keys(details).length > 0) {
          await updateDoc(doc(db, 'users', user.uid), details);
        }

        // Create redemption record
        await addDoc(collection(db, 'redemptions'), {
          userId: user.uid,
          rewardId: option.id,
          rewardTitle: option.title,
          cost: option.cost,
          redeemedAt: serverTimestamp(),
          status: 'pending' // or completed
        });

        // Deduct points
        await updateDoc(doc(db, 'users', user.uid), {
          points: increment(-option.cost)
        });

        // Add notification
        await addDoc(collection(db, 'notifications'), {
          userId: user.uid,
          title: 'Redemption Successful',
          message: `You redeemed ${option.title} for ${option.cost} points.`,
          read: false,
          createdAt: serverTimestamp(),
          type: 'redemption'
        });

        showToast('Redemption Successful!', `You redeemed ${option.title}.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'redemptions');
      }
    } else {
      showToast('Not enough points', `You need ${option.cost - userProfile.points} more points.`);
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

  if (loading) {
    return <div className="min-h-screen bg-neutral-900 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const completedSurveyIds = submissions.map(s => s.surveyId);
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center sm:p-8 font-sans">
      <div className="w-full max-w-md h-[100dvh] sm:h-[850px] bg-gray-50 sm:rounded-[3rem] sm:shadow-2xl overflow-hidden relative flex flex-col sm:border-[12px] border-neutral-800">
        
        <div className="hidden sm:flex justify-between items-center px-6 py-3 bg-white text-xs font-medium text-gray-800 z-50">
          <span>9:41</span>
          <div className="flex items-center gap-2">
            <Wifi size={14} />
            <div className="w-5 h-3 bg-gray-800 rounded-sm relative">
              <div className="absolute right-0.5 top-0.5 bottom-0.5 left-0.5 bg-white rounded-[1px]"></div>
            </div>
          </div>
        </div>

        <>
          {view !== 'survey_active' && userProfile && (
            <header className="bg-white px-6 py-4 flex justify-between items-center z-10 border-b-4 border-brand-dark relative">
                <div>
                  <h1 className="text-2xl font-bold text-brand-dark tracking-tight uppercase">Rivabit</h1>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Hello, {userProfile.displayName?.split(' ')[0] || 'User'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setShowNotificationsPanel(!showNotificationsPanel);
                      if (!showNotificationsPanel) markNotificationsRead();
                    }}
                    className="relative p-2 text-brand-dark hover:bg-[#E8F0FE] rounded-xl transition-colors border-2 border-transparent hover:border-brand-dark"
                  >
                    <Bell size={24} />
                    {unreadNotifsCount > 0 && (
                      <span className="absolute top-1 right-1 w-3 h-3 bg-[#FF90E8] rounded-full border-2 border-brand-dark"></span>
                    )}
                  </button>
                  <motion.div 
                    key={userProfile.points}
                    initial={{ scale: 1.2, color: '#10b981' }}
                    animate={{ scale: 1, color: '#1E242D' }}
                    className="flex items-center gap-1.5 bg-[#FFC900] px-3 py-1.5 rounded-xl text-brand-dark font-bold border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(30,36,45,1)]"
                  >
                    <Coins size={20} />
                    <span>{userProfile.points}</span>
                  </motion.div>
                </div>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotificationsPanel && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-4 mt-2 w-80 bg-white rounded-2xl border-4 border-brand-dark shadow-[4px_4px_0px_0px_rgba(30,36,45,1)] overflow-hidden z-50"
                    >
                      <div className="p-4 border-b-4 border-brand-dark bg-[#FF90E8]">
                        <h3 className="font-bold text-brand-dark uppercase tracking-wide">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto p-2">
                        {notifications.length > 0 ? notifications.map(n => (
                          <div key={n.id} className={`p-3 rounded-xl mb-2 border-2 border-brand-dark ${!n.read ? 'bg-[#E8F0FE]' : 'bg-white'}`}>
                            <h4 className="text-sm font-bold text-brand-dark uppercase tracking-wide">{n.title}</h4>
                            <p className="text-xs text-gray-600 mt-0.5 font-bold">{n.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block font-bold uppercase">
                              {n.createdAt ? new Date(n.createdAt.toDate()).toLocaleString() : 'Just now'}
                            </span>
                          </div>
                        )) : (
                          <p className="text-sm text-gray-500 text-center py-6 font-bold">No notifications yet.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </header>
            )}

            <main className="flex-1 overflow-y-auto relative bg-gray-50 pb-24" onClick={() => showNotificationsPanel && setShowNotificationsPanel(false)}>
              <AnimatePresence mode="wait">
                {view === 'home' && userProfile && (
                  <HomeView 
                    key="home" 
                    userProfile={userProfile}
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
                {view === 'trivia' && (
                  <TriviaView 
                    key="trivia" 
                    onEarnPoints={handleEarnTriviaPoints}
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
                {view === 'rewards' && userProfile && (
                  <RewardsView 
                    key="rewards" 
                    userProfile={userProfile} 
                    redeemReward={redeemReward} 
                    redemptions={redemptions}
                  />
                )}
                {view === 'profile' && userProfile && (
                  <ProfileView 
                    key="profile" 
                    userProfile={userProfile}
                    redemptions={redemptions}
                    submissions={submissions}
                  />
                )}
              </AnimatePresence>
            </main>

            {view !== 'survey_active' && (
              <nav className="absolute bottom-0 w-full bg-white border-t-4 border-brand-dark px-2 py-4 pb-safe flex justify-between items-center z-20">
                <NavItem icon={Home} label="Home" isActive={view === 'home'} onClick={() => setView('home')} />
                <NavItem icon={ClipboardList} label="Surveys" isActive={view === 'surveys'} onClick={() => setView('surveys')} />
                <NavItem icon={BrainCircuit} label="Trivia" isActive={view === 'trivia'} onClick={() => setView('trivia')} />
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
              className="absolute top-0 left-4 right-4 bg-brand-dark text-white p-4 rounded-2xl border-4 border-brand-dark shadow-[4px_4px_0px_0px_rgba(30,36,45,1)] z-50 flex items-start gap-3"
            >
              <div className="bg-[#23A094] p-2 rounded-xl text-brand-dark border-2 border-brand-dark">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg uppercase tracking-wide">{toast.title}</h4>
                <p className="text-sm text-gray-300 mt-0.5 font-bold">{toast.message}</p>
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
      className={`flex flex-col items-center justify-center w-14 gap-1 transition-colors ${isActive ? 'text-brand-blue' : 'text-gray-400 hover:text-brand-dark'}`}
    >
      <div className="relative">
        <Icon size={24} strokeWidth={isActive ? 3 : 2} />
        {isActive && (
          <motion.div 
            layoutId="nav-indicator"
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-blue rounded-full"
          />
        )}
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-wide mt-1 ${isActive ? 'text-brand-blue' : ''}`}>{label}</span>
    </button>
  );
}

