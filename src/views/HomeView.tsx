import React from 'react';
import { motion } from 'motion/react';
import { Zap, CheckCircle2, Coins, Clock, ClipboardList } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Survey, RewardCategory, UserProfile } from '../types';
import { MOCK_SURVEYS, REWARD_CATEGORIES } from '../data';

interface HomeViewProps {
  userProfile: UserProfile;
  completedSurveys: string[];
  startSurvey: (s: Survey) => void;
  setView: (v: any) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ userProfile, completedSurveys, startSurvey, setView }) => {
  const availableSurveys = MOCK_SURVEYS.filter(s => !completedSurveys.includes(s.id));

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-6 space-y-8"
    >
      {/* Hero Card */}
      <div className="bg-[#1F2937] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <h2 className="font-medium mb-1 text-gray-200">Welcome back, {userProfile.displayName?.split(' ')[0] || 'User'}!</h2>
        <div className="text-2xl font-semibold mb-4 flex items-center gap-2 leading-tight">
          <Zap className="text-white fill-white opacity-80" size={24} />
          Ready to earn?
        </div>
        <button 
          onClick={() => setView('surveys')}
          className="bg-white text-gray-900 px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm hover:bg-gray-50 transition-colors"
        >
          Answer Now
        </button>
      </div>

      {/* Featured Surveys */}
      <section>
        <div className="space-y-3">
          {availableSurveys.length > 0 ? (
            availableSurveys.slice(0, 2).map(survey => (
              <SurveyCard key={survey.id} survey={survey} onClick={() => startSurvey(survey)} />
            ))
          ) : (
            <div className="bg-white p-6 rounded-2xl text-center shadow-sm border border-gray-100">
              <CheckCircle2 className="mx-auto text-[#1F2937] mb-2" size={40} />
              <p className="text-gray-900 font-medium text-lg">You're all caught up!</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Rewards */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Rewards</h3>
        <div className="grid grid-cols-2 gap-3">
          {REWARD_CATEGORIES.slice(0, 4).map(cat => {
            // Dynamically get icon component
            const Icon = (Icons as any)[cat.iconName];
            return (
              <div 
                key={cat.id} 
                onClick={() => setView('rewards')}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-full bg-gray-100 text-[#1F2937] flex items-center justify-center`}>
                  {Icon && <Icon size={24} />}
                </div>
                <span className="font-medium text-gray-900 text-sm">{cat.title}</span>
              </div>
            );
          })}
        </div>
      </section>
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
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#1F2937] shrink-0">
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
      <div className="flex items-center gap-1 text-[#1F2937] font-semibold text-sm shrink-0 bg-gray-100 px-3 py-1.5 rounded-full">
        <Coins size={14} />
        {survey.bits}
      </div>
    </motion.div>
  );
}
