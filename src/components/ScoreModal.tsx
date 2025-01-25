import React from 'react';
import { X, Award, Coins } from 'lucide-react';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
}

const ScoreModal: React.FC<ScoreModalProps> = ({ isOpen, onClose, score }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-8 max-w-md w-full mx-4 relative border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">AI Score: {score}</h2>
          <p className="text-white/80 mb-6">
            {score >= 90 ? "Outstanding! Your creativity knows no bounds!" :
             score >= 70 ? "Great work! Keep pushing your artistic limits!" :
             "Nice attempt! Practice makes perfect!"}
          </p>
          
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">+{Math.floor(score / 10)} ERC7007 Tokens Earned</span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold transition"
          >
            Continue Drawing
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreModal;