import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Coins } from 'lucide-react';
import { View, UserProfile } from '../types';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

interface ProfileBuilderViewProps {
  setView: (view: View) => void;
  userProfile: UserProfile;
}

const PROFILE_SECTIONS = [
  {
    id: 'occupation',
    title: 'Occupation',
    questions: [
      {
        id: 'employment',
        question: 'What is your employment status?',
        options: ['Employed full-time', 'Employed part-time', 'Self-employed', 'Unemployed', 'Student']
      },
      {
        id: 'industry',
        question: 'What industry do you work in?',
        options: ['Technology', 'Healthcare', 'Education', 'Finance', 'Other']
      }
    ]
  },
  {
    id: 'shopping',
    title: 'Shopping',
    questions: [
      {
        id: 'shopping_frequency',
        question: 'How often do you shop online?',
        options: ['Weekly', 'Monthly', 'Rarely', 'Never']
      },
      {
        id: 'shopping_category',
        question: 'What is your primary shopping category?',
        options: ['Electronics', 'Fashion', 'Groceries', 'Home & Garden']
      }
    ]
  },
  {
    id: 'language',
    title: 'Language',
    questions: [
      {
        id: 'primary_language',
        question: 'What is your primary language?',
        options: ['English', 'Spanish', 'French', 'Other']
      },
      {
        id: 'fluency',
        question: 'Are you fluent in any secondary languages?',
        options: ['Yes', 'No']
      }
    ]
  }
];

export function ProfileBuilderView({ setView, userProfile }: ProfileBuilderViewProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`profile_progress_${userProfile.uid}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          setCurrentSectionIndex(parsed.currentSectionIndex || 0);
          setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
          setAnswers(parsed.answers || {});
        }
      }
    } catch (e) {
      console.error("Failed to load profile progress", e);
    }
    setIsLoaded(true);
  }, [userProfile.uid]);

  useEffect(() => {
    if (isLoaded) {
      if (isFinished) {
        localStorage.removeItem(`profile_progress_${userProfile.uid}`);
      } else {
        localStorage.setItem(`profile_progress_${userProfile.uid}`, JSON.stringify({
          currentSectionIndex,
          currentQuestionIndex,
          answers
        }));
      }
    }
  }, [currentSectionIndex, currentQuestionIndex, answers, isFinished, isLoaded, userProfile.uid]);

  const currentSection = PROFILE_SECTIONS[currentSectionIndex];
  const currentQ = currentSection.questions[currentQuestionIndex];

  const handleOptionSelect = (option: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: option
    }));
  };

  const handleNext = async () => {
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentSectionIndex < PROFILE_SECTIONS.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
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

  if (!isLoaded) {
    return null;
  }

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

  const progressPercent = Math.round(((currentQuestionIndex) / currentSection.questions.length) * 100);
  const nextProgressPercent = Math.round(((currentQuestionIndex + 1) / currentSection.questions.length) * 100);

  const isLastQuestionOverall = currentSectionIndex === PROFILE_SECTIONS.length - 1 && currentQuestionIndex === currentSection.questions.length - 1;

  return (
    <div className="flex-1 bg-[#fbf9ee] flex flex-col p-6 max-w-md mx-auto overflow-y-auto scrollbar-hide w-full">
      <div className="pt-8 pb-6">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-4xl font-bold text-[#8B319E]">{nextProgressPercent}%</span>
          <div className="flex-1 h-8 bg-[#F8F9FA] rounded-md overflow-hidden">
            <motion.div 
              className="h-full bg-[#8B319E] rounded-md"
              initial={{ width: `${progressPercent}%` }}
              animate={{ width: `${nextProgressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        
        <p className="text-[#6B7280] text-center text-lg leading-relaxed mb-6">
          Complete your <span className="font-bold text-[#374151]">{currentSection.title}</span> profile so we can more easily match you to studies that fit your lifestyle!
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <motion.div 
          key={`${currentSectionIndex}-${currentQuestionIndex}`}
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
          className="w-full bg-[#8B319E] text-white py-4 px-6 rounded-2xl font-bold text-xl flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLastQuestionOverall ? 'Complete profile' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}
