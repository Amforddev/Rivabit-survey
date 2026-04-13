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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Available Surveys</h2>
      </div>
      
      <div className="space-y-3 relative z-10">
        {availableSurveys.length > 0 ? (
          availableSurveys.map(survey => (
            <SurveyCard key={survey.id} survey={survey} onClick={() => startSurvey(survey)} />
          ))
        ) : (
          <div className="bg-white p-6 rounded-2xl text-center shadow-sm border border-gray-100">
            <p className="text-gray-500 font-medium text-base">No new surveys at the moment. Check back later!</p>
          </div>
        )}
      </div>

      {doneSurveys.length > 0 && (
        <div className="pt-6 relative z-10">
          <h3 className="text-lg font-semibold text-gray-400 mb-3">Completed</h3>
          <div className="space-y-3 opacity-70">
            {doneSurveys.map(survey => (
              <div key={survey.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center grayscale">
                <div>
                  <h4 className="font-medium text-gray-900 text-base line-through">{survey.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">Completed</p>
                </div>
                <CheckCircle2 className="text-[#1F2937]" size={24} />
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
