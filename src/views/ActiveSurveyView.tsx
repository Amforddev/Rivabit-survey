import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Survey } from '../types';

interface ActiveSurveyViewProps {
  survey: Survey;
  onFinish: (pts: number, id: string) => void;
  onCancel: () => void;
}

const ActiveSurveyView: React.FC<ActiveSurveyViewProps> = ({ survey, onFinish, onCancel }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const question = survey.questions[currentQIndex];

  const handleSelect = (option: string) => {
    if (selectedOption) return; // Prevent double click
    setSelectedOption(option);
    
    setTimeout(() => {
      if (currentQIndex < survey.questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setIsCompleting(true);
        setTimeout(() => {
          onFinish(survey.points, survey.id);
        }, 1500);
      }
    }, 600);
  };

  if (isCompleting) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#23A094]"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", damping: 12 }}
          className="w-28 h-28 bg-white rounded-full flex items-center justify-center mb-6 text-brand-dark border-4 border-brand-dark shadow-[4px_4px_0px_0px_rgba(30,36,45,1)]"
        >
          <CheckCircle2 size={56} />
        </motion.div>
        <h2 className="text-4xl font-bold text-brand-dark mb-2 uppercase tracking-wide">Survey Complete!</h2>
        <p className="text-brand-dark font-bold text-lg mb-6">You've earned <span className="bg-[#FFC900] px-2 py-1 rounded-md border-2 border-brand-dark">{survey.points} points</span></p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="h-full flex flex-col bg-white"
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-4 border-b-4 border-brand-dark bg-[#FFC900]">
        <button onClick={onCancel} className="p-2 -ml-2 text-brand-dark hover:bg-white rounded-full transition-colors border-2 border-transparent hover:border-brand-dark">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <div className="h-4 bg-white border-2 border-brand-dark rounded-full overflow-hidden shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.1)]">
            <motion.div 
              className="h-full bg-brand-blue border-r-2 border-brand-dark"
              initial={{ width: `${((currentQIndex) / survey.questions.length) * 100}%` }}
              animate={{ width: `${((currentQIndex + 1) / survey.questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <span className="text-sm font-bold text-brand-dark w-8 text-right">
          {currentQIndex + 1}/{survey.questions.length}
        </span>
      </div>

      {/* Question Content */}
      <div className="flex-1 p-6 flex flex-col bg-gray-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-3xl font-bold text-brand-dark mb-8 mt-4 leading-tight uppercase tracking-wide">
              {question.text}
            </h2>

            <div className="space-y-4 mt-auto mb-8">
              {question.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                return (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(option)}
                    disabled={selectedOption !== null}
                    className={`w-full text-left p-5 rounded-2xl border-2 font-bold text-lg transition-all duration-200 uppercase tracking-wide ${
                      isSelected 
                        ? 'border-brand-dark bg-[#FF90E8] text-brand-dark shadow-[4px_4px_0px_0px_rgba(30,36,45,1)] translate-y-[-2px] translate-x-[-2px]' 
                        : 'border-brand-dark bg-white text-brand-dark hover:bg-[#E8F0FE] shadow-[2px_2px_0px_0px_rgba(30,36,45,1)]'
                    }`}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default ActiveSurveyView;
