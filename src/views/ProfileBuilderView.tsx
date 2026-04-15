import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Coins } from 'lucide-react';
import { View, UserProfile } from '../types';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

interface ProfileBuilderViewProps {
  setView: (view: View) => void;
  userProfile: UserProfile;
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

export function ProfileBuilderView({ setView, userProfile }: ProfileBuilderViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleOptionSelect = (option: string) => {
    setAnswers(prev => ({
      ...prev,
      [PROFILE_QUESTIONS[currentStep].id]: option
    }));
  };

  const handleNext = async () => {
    if (currentStep < PROFILE_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid), {
          berry: increment(500),
          profileCompleted: true,
          profileData: answers
        });
        setIsFinished(true);
      } catch (e) {
        console.error("Failed to complete profile", e);
        setIsFinished(true); // Still show success screen for UX
      }
    }
  };

  if (isFinished) {
    return (
      <div className="flex-1 bg-[#fbf9ee] flex flex-col items-center justify-center p-6 w-full">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Profile Complete!</h2>
          <p className="text-gray-500 mb-6">Thanks for helping us know you better.</p>
          
          <div className="bg-gray-100 rounded-2xl p-4 flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
              <Coins size={18} />
            </div>
            <span className="text-xl font-semibold text-gray-900">+500 Berries Earned</span>
          </div>

          <button 
            onClick={() => setView('home')}
            className="w-full bg-accent text-white py-4 px-6 rounded-full font-semibold text-lg flex items-center justify-between transition-all hover:opacity-90 active:scale-[0.98] shadow-sm group"
          >
            <span>Go to Dashboard</span>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform">
              <ArrowRight size={20} />
            </div>
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQ = PROFILE_QUESTIONS[currentStep];
  const progressPercent = Math.round(((currentStep) / PROFILE_QUESTIONS.length) * 100);
  const nextProgressPercent = Math.round(((currentStep + 1) / PROFILE_QUESTIONS.length) * 100);

  return (
    <div className="flex-1 bg-[#fbf9ee] flex flex-col p-6 max-w-md mx-auto overflow-y-auto scrollbar-hide w-full">
      <div className="pt-8 pb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Build your profile</h1>
        <p className="text-gray-500 text-sm mb-6">Answer a few questions to get personalized surveys and earn your first 500 Berries.</p>
        
        <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-2">
          <span className="font-bold text-gray-700">{nextProgressPercent}% Completed</span>
          <span className="text-primary">{PROFILE_QUESTIONS.length - currentStep} remaining</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: `${progressPercent}%` }}
            animate={{ width: `${nextProgressPercent}%` }}
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
                      ? 'border-primary bg-gray-100 text-gray-900' 
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
          className="w-full bg-accent text-white py-4 px-6 rounded-full font-semibold text-lg flex items-center justify-between transition-all hover:opacity-90 active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <span>{currentStep < PROFILE_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Profile'}</span>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform">
            <ArrowRight size={20} />
          </div>
        </button>
      </div>
    </div>
  );
}
