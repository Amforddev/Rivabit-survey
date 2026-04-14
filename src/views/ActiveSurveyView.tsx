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
          onFinish(survey.berry, survey.id);
        }, 1500);
      }
    }, 600);
  };

  if (isCompleting) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex flex-col items-center justify-center p-6 text-center bg-primary"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", damping: 12 }}
          className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-primary shadow-lg"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-3xl font-semibold text-white mb-2">Survey Complete!</h2>
        <p className="text-blue-50 font-medium text-lg mb-6">You've earned <span className="bg-white text-gray-900 px-3 py-1 rounded-full ml-1">{survey.berry} Berry</span></p>
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
      <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100 bg-white">
        <button onClick={onCancel} className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: `${((currentQIndex) / survey.questions.length) * 100}%` }}
              animate={{ width: `${((currentQIndex + 1) / survey.questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <span className="text-sm font-medium text-gray-500 w-8 text-right">
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 mt-4 leading-tight">
              {question.text}
            </h2>

            <div className="space-y-3 mt-auto mb-8">
              {question.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                return (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(option)}
                    disabled={selectedOption !== null}
                    className={`w-full text-left p-4 rounded-xl border font-medium text-base transition-all duration-200 ${
                      isSelected 
                        ? 'border-primary bg-gray-100 text-gray-900' 
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
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
