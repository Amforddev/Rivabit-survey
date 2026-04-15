import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ClipboardList, Coins, Clock, Lock, X } from 'lucide-react';
import { Survey, UserProfile } from '../types';
import { MOCK_SURVEYS } from '../data';

interface SurveysViewProps {
  userProfile: UserProfile;
  completedSurveys: string[];
  startSurvey: (s: Survey) => void;
  setView: (v: any) => void;
}

const SurveysView: React.FC<SurveysViewProps> = ({ userProfile, completedSurveys, startSurvey, setView }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(MOCK_SURVEYS.map(s => s.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const availableSurveys = MOCK_SURVEYS.filter(s => !completedSurveys.includes(s.id) && (selectedCategory === 'All' || s.category === selectedCategory));
  const doneSurveys = MOCK_SURVEYS.filter(s => completedSurveys.includes(s.id) && (selectedCategory === 'All' || s.category === selectedCategory));

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
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
