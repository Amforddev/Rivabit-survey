import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ClipboardList, Coins, Clock, Lock, X, PlayCircle, ChevronLeft } from 'lucide-react';
import { Survey, UserProfile } from '../types';
import { MOCK_SURVEYS } from '../data';
import { db } from '../firebase';
import { updateDoc, doc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface SurveysViewProps {
  userProfile: UserProfile;
  completedSurveys: string[];
  startSurvey: (s: Survey) => void;
  setView: (v: any) => void;
}

const SurveysView: React.FC<SurveysViewProps> = ({ userProfile, completedSurveys, startSurvey, setView }) => {
  const [showActivities, setShowActivities] = useState<boolean>(true);
  const [showAds, setShowAds] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(MOCK_SURVEYS.map(s => s.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const availableSurveys = MOCK_SURVEYS.filter(s => !completedSurveys.includes(s.id) && (selectedCategory === 'All' || s.category === selectedCategory));
  const doneSurveys = MOCK_SURVEYS.filter(s => completedSurveys.includes(s.id) && (selectedCategory === 'All' || s.category === selectedCategory));

  if (showAds) {
    return <AdPlayer userProfile={userProfile} onClose={() => setShowAds(false)} />;
  }

  if (showActivities) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="p-6 space-y-6"
      >
        <div className="flex flex-col mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Activities</h2>
          <p className="text-sm text-gray-500 font-medium">Choose how you want to earn berries</p>
        </div>

        <div className="space-y-4">
          {/* Surveys Option */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowActivities(false)}
            className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 cursor-pointer flex items-center gap-4 hover:border-primary/20 transition-all relative overflow-hidden group"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
              <ClipboardList size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-0.5">Surveys</h3>
              <p className="text-xs text-gray-500 font-medium">Share your opinions and earn berries</p>
            </div>
          </motion.div>

          {/* Watch Ads Option */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAds(true)}
            className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 cursor-pointer flex items-center gap-4 hover:border-indigo-500/20 transition-all relative overflow-hidden group"
          >
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
              <PlayCircle size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-0.5">Watch Ads</h3>
              <p className="text-xs text-gray-500 font-medium">Watch short videos for quick rewards</p>
            </div>
          </motion.div>
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
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setShowActivities(true)}
          className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-600 border border-gray-100 hover:bg-gray-50"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-semibold text-gray-900">Available Surveys</h2>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat 
                ? 'bg-primary text-white' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      
      <div className="space-y-3 relative z-10">
        {!userProfile.profileCompleted ? (
          <div className="bg-white p-6 rounded-2xl text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3">
              <Lock size={24} />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Surveys Locked</h4>
            <p className="text-sm text-gray-500 mb-4">Complete your profile to unlock and start earning rewards.</p>
            <button 
              onClick={() => setView('profile-builder')}
              className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Complete Profile
            </button>
          </div>
        ) : availableSurveys.length > 0 ? (
          availableSurveys.map(survey => (
            <SurveyCard key={survey.id} survey={survey} onClick={() => setSelectedSurvey(survey)} />
          ))
        ) : (
          <div className="bg-white p-6 rounded-2xl text-center shadow-sm border border-gray-100">
            <p className="text-gray-500 font-medium text-base">No new surveys at the moment. Check back later!</p>
          </div>
        )}
      </div>

      {userProfile.profileCompleted && doneSurveys.length > 0 && (
        <div className="pt-6 relative z-10">
          <h3 className="text-lg font-semibold text-gray-400 mb-3">Completed</h3>
          <div className="space-y-3 opacity-70">
            {doneSurveys.map(survey => (
              <div key={survey.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center grayscale">
                <div>
                  <h4 className="font-medium text-gray-900 text-base line-through">{survey.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">Completed</p>
                </div>
                <CheckCircle2 className="text-primary" size={24} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pre-start Modal */}
      <AnimatePresence>
        {selectedSurvey && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
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

export default SurveysView;

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

const AdPlayer: React.FC<{ userProfile: UserProfile, onClose: () => void }> = ({ userProfile, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [earned, setEarned] = useState(false);
  const duration = 15; // 15 seconds ad
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (progress < duration && !earned) {
      timer = setTimeout(() => {
        setProgress(p => p + 1);
      }, 1000);
    } else if (progress >= duration && !earned) {
      // Ad finished, reward user
      const reward = async () => {
        try {
          // Add 10 berries per ad watched
          await updateDoc(doc(db, 'users', userProfile.uid), {
            berry: increment(10)
          });
          
          // Using a submission to show in feed
          await addDoc(collection(db, 'surveySubmissions'), {
            userId: userProfile.uid,
            surveyId: `ad_${Date.now()}`,
            answers: {},
            berryEarned: 10,
            submittedAt: serverTimestamp()
          });
          
          setEarned(true);
        } catch (e) {
          console.error("Error rewarding ad points", e);
        }
      };
      reward();
    }
    return () => clearTimeout(timer);
  }, [progress, earned, userProfile.uid]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 h-full flex flex-col justify-center bg-black/5 rounded-3xl"
    >
      <div className="bg-black rounded-3xl overflow-hidden shadow-2xl relative aspect-[9/16] w-full max-w-sm mx-auto flex flex-col justify-between">
        <div className="p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
          <span className="text-white text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded backdrop-blur-sm">Sponsored Ad</span>
          {earned ? (
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors pointer-events-auto z-20 relative">
              <X size={16} />
            </button>
          ) : (
            <span className="text-white font-mono text-sm shadow-sm">{duration - progress}s</span>
          )}
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {!earned ? (
            <div className="text-center p-6 text-white/80 animate-pulse flex flex-col items-center">
              <PlayCircle size={64} className="mb-4 text-white/50" />
              <p className="font-bold text-lg">Loading Video...</p>
            </div>
          ) : (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 pointer-events-auto z-20 relative"
            >
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Reward Earned!</h3>
              <p className="text-white/80 mb-6 font-medium text-sm">You earned 10 berries</p>
              <button 
                onClick={onClose}
                className="bg-white text-black px-6 py-3 rounded-full font-bold w-full hover:bg-gray-100 transition-colors"
              >
                Close Ad
              </button>
            </motion.div>
          )}
        </div>
        
        {!earned && (
          <div className="h-1 bg-white/20 w-full mt-auto">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-linear" 
              style={{ width: `${(progress / duration) * 100}%` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
