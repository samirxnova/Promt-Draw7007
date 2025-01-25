import React from 'react';
import { Lightbulb, Shuffle } from 'lucide-react';

interface PromptCardProps {
  prompt: string;
  isLoading: boolean;
  onNewPrompt: () => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, isLoading, onNewPrompt }) => {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
          Current Prompt
        </h3>
        <button
          onClick={onNewPrompt}
          disabled={isLoading}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Generate new prompt"
        >
          <Shuffle className="w-4 h-4 text-white" />
        </button>
      </div>
      <div className="mt-4 min-h-[80px] flex items-center">
        {isLoading ? (
          <div className="w-full text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <p className="text-white/80 text-lg leading-relaxed">{prompt}</p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-white/60">
        <span>Time remaining: 5:00</span>
        <span>AI Difficulty: Medium</span>
      </div>
    </div>
  );
};

export default PromptCard;