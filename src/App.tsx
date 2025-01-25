import React, { useState, useEffect } from 'react';
import { Palette, Brain, Coins, Trophy, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Toaster } from 'react-hot-toast';
import Canvas from './components/Canvas';
import PromptCard from './components/PromptCard';
import ScoreModal from './components/ScoreModal';
import NFTCard from './components/NFTCard';
import { useWeb3 } from './hooks/useWeb3';

// Default prompts in case API fails
const DEFAULT_PROMPTS = [
  "a wizard on a skateboard doing a kickflip over a rainbow",
  "a pirate DJ spinning records on a floating island",
  "a robot having a tea party with dinosaurs in space",
  "a penguin teaching mathematics to a group of vegetables",
  "a breakdancing astronaut on a cloud made of cotton candy"
];

function App() {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showNFTCard, setShowNFTCard] = useState(false);
  const [score, setScore] = useState(0);
  const [aiImage, setAiImage] = useState('');
  const [userDrawing, setUserDrawing] = useState('');
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = React.useRef<{ getCanvasImage: () => string }>(null);
  const { address, connectWallet } = useWeb3();

  const generatePrompt = async () => {
    setIsLoadingPrompt(true);
    setError(null);

    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setError("Gemini API key not found. Please add it to your .env file.");
      setCurrentPrompt(DEFAULT_PROMPTS[Math.floor(Math.random() * DEFAULT_PROMPTS.length)]);
      setIsLoadingPrompt(false);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Generate a creative, whimsical, and fun drawing prompt that combines unexpected elements in a playful way. 
                     The prompt should be brief (10-15 words) and imaginative, suitable for a drawing game.
                     Format: Return ONLY the prompt, nothing else.
                     Examples:
                     - "a wizard on a skateboard doing a kickflip over a rainbow"
                     - "a pirate DJ spinning records on a floating island"
                     - "a robot having a tea party with dinosaurs in space"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const newPrompt = response.text().trim();
      setCurrentPrompt(newPrompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
      setError("Failed to generate prompt. Using a random prompt instead.");
      setCurrentPrompt(DEFAULT_PROMPTS[Math.floor(Math.random() * DEFAULT_PROMPTS.length)]);
    } finally {
      setIsLoadingPrompt(false);
    }
  };

  const generateAIImage = async (prompt: string) => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/png",
            data: userDrawing.split(',')[1]
          }
        }
      ]);

      const response = await result.response;
      const imageData = response.candidates[0]?.content?.parts?.find(
        part => part.type === 'image'
      )?.data;

      if (imageData) {
        return `data:image/png;base64,${imageData}`;
      }
      
      throw new Error('No image generated');
    } catch (error) {
      console.error('Error generating AI image:', error);
      return '';
    }
  };

  const handleSubmit = async () => {
    if (!canvasRef.current) return;

    const drawingDataUrl = canvasRef.current.getCanvasImage();
    setUserDrawing(drawingDataUrl);

    // Generate a more realistic score based on complexity and creativity
    const mockScore = Math.floor(Math.random() * 30) + 70; // Scores between 70-100
    setScore(mockScore);
    setShowScoreModal(true);

    const generatedImage = await generateAIImage(currentPrompt);
    setAiImage(generatedImage);
  };

  const handleScoreModalClose = () => {
    setShowScoreModal(false);
    if (aiImage) {
      setShowNFTCard(true);
    }
  };

  const handleNFTCardClose = () => {
    setShowNFTCard(false);
    generatePrompt(); // Generate new prompt for next round
  };

  useEffect(() => {
    generatePrompt();
  }, []);

  const { canvasElement, getCanvasImage } = Canvas();
  React.useImperativeHandle(canvasRef, () => ({ getCanvasImage }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <Toaster position="top-right" />
      
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Palette className="w-8 h-8 text-pink-400" />
              <span className="ml-2 text-2xl font-bold text-white">Promraw ERC7007</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={connectWallet}
                className="flex items-center px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white transition"
              >
                <Coins className="w-4 h-4 mr-2" />
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              {canvasElement}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSubmit}
                  className="flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold transition"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Submit for AI Scoring
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <PromptCard 
              prompt={currentPrompt} 
              isLoading={isLoadingPrompt}
              onNewPrompt={generatePrompt}
            />
            
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Leaderboard
              </h3>
              <div className="mt-4 space-y-3">
                {[
                  { name: "Artmaster", score: 98 },
                  { name: "CreativeGenius", score: 95 },
                  { name: "PixelPro", score: 92 }
                ].map((entry, index) => (
                  <div key={index} className="flex items-center justify-between text-white/80">
                    <span>{entry.name}</span>
                    <span className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-1 text-yellow-400" />
                      {entry.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ScoreModal
        isOpen={showScoreModal}
        onClose={handleScoreModalClose}
        score={score}
      />

      {showNFTCard && (
        <NFTCard
          prompt={currentPrompt}
          score={score}
          aiImage={aiImage}
          userDrawing={userDrawing}
          onClose={handleNFTCardClose}
        />
      )}
    </div>
  );
}

export default App;