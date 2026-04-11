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
      <div className="bg-gradient-to-br from-brand-blue via-[#FF90E8] to-[#FFC900] animate-gradient rounded-2xl p-6 text-brand-dark neo-brutalist relative overflow-hidden">
        <h2 className="font-bold mb-1 text-lg">Welcome back, {userProfile.displayName?.split(' ')[0] || 'User'}!</h2>
        <div className="text-4xl font-bold mb-6 flex items-center gap-2 leading-tight">
          <Zap className="text-white fill-white" size={36} />
          Ready <br/> to earn?
        </div>
        <button 
          onClick={() => setView('surveys')}
          className="bg-white text-brand-dark px-6 py-3 rounded-xl font-bold text-sm border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(30,36,45,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
        >
          View Surveys
        </button>
      </div>

      {/* Featured Surveys */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-bold text-brand-dark uppercase tracking-wide">Featured Surveys</h3>
          <button onClick={() => setView('surveys')} className="text-sm font-bold text-brand-blue uppercase tracking-wide">See All</button>
        </div>
        
        <div className="space-y-4">
          {availableSurveys.length > 0 ? (
            availableSurveys.slice(0, 2).map(survey => (
              <SurveyCard key={survey.id} survey={survey} onClick={() => startSurvey(survey)} />
            ))
          ) : (
            <div className="bg-white p-6 rounded-2xl text-center neo-brutalist">
              <CheckCircle2 className="mx-auto text-[#23A094] mb-2" size={40} />
              <p className="text-brand-dark font-bold text-lg">You're all caught up!</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Rewards */}
      <section>
        <h3 className="text-xl font-bold text-brand-dark mb-4 uppercase tracking-wide">Quick Rewards</h3>
        <div className="grid grid-cols-2 gap-4">
          {REWARD_CATEGORIES.slice(0, 4).map(cat => {
            // Dynamically get icon component
            const Icon = (Icons as any)[cat.iconName];
            return (
              <div 
                key={cat.id} 
                onClick={() => setView('rewards')}
                className="bg-white p-5 rounded-2xl neo-brutalist flex flex-col items-center justify-center gap-3 cursor-pointer active:shadow-none active:translate-y-1 active:translate-x-1 transition-all"
              >
                <div className={`w-14 h-14 rounded-full ${cat.color} text-brand-dark flex items-center justify-center border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(30,36,45,1)]`}>
                  {Icon && <Icon size={28} />}
                </div>
                <span className="font-bold text-brand-dark text-base uppercase tracking-wide">{cat.title}</span>
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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white p-5 rounded-2xl neo-brutalist cursor-pointer flex gap-4 items-center active:shadow-none active:translate-y-1 active:translate-x-1 transition-all"
    >
      <div className="w-16 h-16 bg-[#E8F0FE] border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(30,36,45,1)] rounded-xl flex items-center justify-center text-brand-dark shrink-0">
        <ClipboardList size={32} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-brand-dark text-lg truncate pr-2">{survey.title}</h4>
          <div className="flex items-center gap-1 text-brand-dark font-bold text-sm shrink-0 bg-[#FFC900] px-2.5 py-1 rounded-md border-2 border-brand-dark">
            <Coins size={14} />
            {survey.points}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 font-bold uppercase tracking-wide">
          <span className="flex items-center gap-1"><Clock size={14} /> {survey.time}</span>
          <span className="w-1.5 h-1.5 bg-brand-dark rounded-full"></span>
          <span>{survey.category}</span>
        </div>
      </div>
    </motion.div>
  );
}
