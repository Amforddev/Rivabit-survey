import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Coins } from 'lucide-react';
import { View } from '../types';

interface ProfileBuilderViewProps {
  setView: (view: View) => void;
}

const PROFILE_QUESTIONS = [
  {
    id: 'gender',
    question: 'What is your gender?',
    options: ['Male', 'Female', 'Non-binary', 'Prefer not to say']
  },
  {
    id: 'age',
    question: 'What is your age range?',
    options: ['18-24', '25-34', '35-44', '45+']
  },
  {
    id: 'shopping',
    question: 'What are your primary shopping interests?',
    options: ['Electronics', 'Fashion', 'Groceries', 'Home & Garden']
  },
  {
    id: 'travel',
    question: 'How often do you travel?',
    options: ['Frequently', 'Occasionally', 'Rarely', 'Never']
  }
];

export function ProfileBuilderView({ setView }: ProfileBuilderViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleOptionSelect = (option: string) => {
    setAnswers(prev => ({
      ...prev,
      [PROFILE_QUESTIONS[currentStep].id]: option
    }));
  };

  const handleNext = () => {
    if (currentStep < PROFILE_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-[#1F2937]" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Profile Complete!</h2>
          <p className="text-gray-500 mb-6">Thanks for helping us know you better.</p>
          
          <div className="bg-gray-100 rounded-2xl p-4 flex items-center justify-center gap-2 mb-8">
            <Coins className="text-[#1F2937]" size={24} />
            <span className="text-xl font-semibold text-gray-900">+500 Bits Earned</span>
          </div>

          <button 
            onClick={() => setView('home')}
            className="w-full bg-[#1F2937] text-white py-4 rounded-xl font-medium text-lg hover:bg-gray-900 transition-colors shadow-sm"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQ = PROFILE_QUESTIONS[currentStep];
  const progress = ((currentStep) / PROFILE_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6 max-w-md mx-auto">
      <div className="pt-8 pb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Build your profile</h1>
        <p className="text-gray-500 text-sm mb-6">Answer a few questions to get personalized surveys and earn your first 500 Bits.</p>
        
        <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-2">
          <span>Question {currentStep + 1} of {PROFILE_QUESTIONS.length}</span>
          <span className="text-[#1F2937]">{PROFILE_QUESTIONS.length - currentStep} remaining</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#1F2937]"
            initial={{ width: `${progress}%` }}
            animate={{ width: `${((currentStep + 1) / PROFILE_QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-medium text-gray-900 mb-6">{currentQ.question}</h2>
          
          <div className="space-y-3">
            {currentQ.options.map((option) => {
              const isSelected = answers[currentQ.id] === option;
              return (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left p-4 rounded-xl border font-medium text-base transition-all duration-200 ${
                    isSelected 
                      ? 'border-[#1F2937] bg-gray-100 text-gray-900' 
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="pt-6 pb-8">
        <button 
          onClick={handleNext}
          disabled={!answers[currentQ.id]}
          className="w-full bg-[#1F2937] text-white py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep < PROFILE_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Profile'}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
