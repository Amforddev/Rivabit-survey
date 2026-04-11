import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, CheckCircle2, XCircle, Coins, ArrowRight } from 'lucide-react';
import { MOCK_TRIVIA } from '../data';

interface TriviaViewProps {
  onEarnPoints: (points: number) => void;
}

const TriviaView: React.FC<TriviaViewProps> = ({ onEarnPoints }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = MOCK_TRIVIA[currentQuestionIndex];

  const handleOptionSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);

    if (index === question.correctAnswerIndex) {
      setScore(prev => prev + question.points);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < MOCK_TRIVIA.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
      if (score > 0) {
        onEarnPoints(score);
      }
    }
  };

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="w-24 h-24 bg-[#FFC900] rounded-full flex items-center justify-center mb-6 border-4 border-brand-dark shadow-[4px_4px_0px_0px_rgba(30,36,45,1)]">
          <BrainCircuit size={48} className="text-brand-dark" />
        </div>
        <h2 className="text-3xl font-bold text-brand-dark mb-2 uppercase tracking-wide">Trivia Complete!</h2>
        <p className="text-gray-600 mb-8 font-bold">You scored {score} points.</p>
        
        <div className="bg-white p-6 rounded-2xl neo-brutalist w-full max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-gray-500 uppercase">Total Earned</span>
            <div className="flex items-center gap-1 text-brand-dark font-bold text-xl bg-[#FFC900] px-3 py-1.5 rounded-xl border-2 border-brand-dark">
              <Coins size={20} />
              {score}
            </div>
          </div>
          <button 
            onClick={() => {
              setCurrentQuestionIndex(0);
              setSelectedOption(null);
              setShowResult(false);
              setScore(0);
              setIsFinished(false);
            }}
            className="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(30,36,45,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5"
          >
            Play Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-6 h-full flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brand-dark uppercase tracking-wide flex items-center gap-2">
          <BrainCircuit className="text-[#FF90E8]" />
          Daily Trivia
        </h2>
        <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">
          {currentQuestionIndex + 1} / {MOCK_TRIVIA.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white p-6 rounded-2xl neo-brutalist mb-6 flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-brand-dark uppercase tracking-wide bg-[#E8F0FE] px-3 py-1 rounded-full border-2 border-brand-dark">
              Question {currentQuestionIndex + 1}
            </span>
            <div className="flex items-center gap-1 text-brand-dark font-bold text-sm bg-[#FFC900] px-2 py-1 rounded-md border-2 border-brand-dark">
              <Coins size={14} />
              {question.points}
            </div>
          </div>
          <h3 className="text-xl font-bold text-brand-dark leading-snug">
            {question.question}
          </h3>
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === question.correctAnswerIndex;
            
            let buttonClass = "w-full text-left p-4 rounded-xl font-bold text-lg transition-all border-2 border-brand-dark flex justify-between items-center ";
            
            if (!showResult) {
              buttonClass += "bg-white hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(30,36,45,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5";
            } else {
              if (isCorrect) {
                buttonClass += "bg-[#23A094] text-white";
              } else if (isSelected) {
                buttonClass += "bg-red-500 text-white";
              } else {
                buttonClass += "bg-gray-100 text-gray-400 border-gray-300";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={showResult}
                className={buttonClass}
              >
                <span>{option}</span>
                {showResult && isCorrect && <CheckCircle2 size={20} />}
                {showResult && isSelected && !isCorrect && <XCircle size={20} />}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <button
                onClick={handleNext}
                className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(30,36,45,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5"
              >
                {currentQuestionIndex < MOCK_TRIVIA.length - 1 ? 'Next Question' : 'Finish'}
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default TriviaView;
