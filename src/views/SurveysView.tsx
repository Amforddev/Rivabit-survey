import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ClipboardList, Coins, Clock } from 'lucide-react';
import { Survey } from '../types';
import { MOCK_SURVEYS } from '../data';

interface SurveysViewProps {
  completedSurveys: string[];
  startSurvey: (s: Survey) => void;
}

const SurveysView: React.FC<SurveysViewProps> = ({ completedSurveys, startSurvey }) => {
  const availableSurveys = MOCK_SURVEYS.filter(s => !completedSurveys.includes(s.id));
  const doneSurveys = MOCK_SURVEYS.filter(s => completedSurveys.includes(s.id));

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-6 space-y-6"
    >
      <h2 className="text-3xl font-bold text-brand-dark uppercase tracking-wide">Available Surveys</h2>
      
      <div className="space-y-4">
        {availableSurveys.length > 0 ? (
          availableSurveys.map(survey => (
            <SurveyCard key={survey.id} survey={survey} onClick={() => startSurvey(survey)} />
          ))
        ) : (
          <div className="bg-white p-6 rounded-2xl text-center neo-brutalist">
            <p className="text-gray-500 font-bold text-lg">No new surveys at the moment. Check back later!</p>
          </div>
        )}
      </div>

      {doneSurveys.length > 0 && (
        <div className="pt-8">
          <h3 className="text-xl font-bold text-gray-400 mb-4 uppercase tracking-wide">Completed</h3>
          <div className="space-y-4 opacity-70">
            {doneSurveys.map(survey => (
              <div key={survey.id} className="bg-white p-5 rounded-2xl neo-brutalist flex justify-between items-center grayscale">
                <div>
                  <h4 className="font-bold text-brand-dark text-lg line-through">{survey.title}</h4>
                  <p className="text-sm text-gray-500 mt-1 font-bold uppercase tracking-wide">Completed</p>
                </div>
                <CheckCircle2 className="text-[#23A094]" size={28} />
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default SurveysView;

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
