import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Loader } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import { uploadToIPFS } from '../services/ipfs';
import toast from 'react-hot-toast';

interface NFTCardProps {
  prompt: string;
  score: number;
  aiImage: string;
  userDrawing: string;
  onClose: () => void;
}

const NFTCard: React.FC<NFTCardProps> = ({ prompt, score, aiImage, userDrawing, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { address, connectWallet, mintNFT, isConnecting, error: web3Error } = useWeb3();
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintingStep, setMintingStep] = useState<string>('');

  const downloadCard = async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await toPng(cardRef.current);
        const link = document.createElement('a');
        link.download = 'promraw-nft-card.png';
        link.href = dataUrl;
        link.click();
        toast.success('Card downloaded successfully!');
      } catch (error) {
        console.error('Error downloading card:', error);
        toast.error('Failed to download card');
      }
    }
  };

  const handleMint = async () => {
    if (!address) {
      await connectWallet();
      return;
    }

    try {
      setIsMinting(true);
      setMintError(null);

      // Step 1: Prepare card image
      setMintingStep('Preparing card image...');
      const cardImage = await toPng(cardRef.current!);
      const blob = await (await fetch(cardImage)).blob();

      // Step 2: Upload to IPFS
      setMintingStep('Uploading to IPFS...');
      const tokenURI = await uploadToIPFS(
        blob,
        `Promraw #${Date.now()}`,
        prompt,
        [
          { trait_type: "Score", value: score },
          { trait_type: "Rarity", value: score >= 90 ? "Legendary" : score >= 70 ? "Rare" : "Common" }
        ]
      );

      // Step 3: Mint NFT
      setMintingStep('Minting NFT...');
      const txHash = await mintNFT(tokenURI);
      
      toast.success('NFT minted successfully!');
      console.log('NFT minted:', txHash);
      
      // Close the card after successful mint
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Error minting NFT:', error);
      setMintError('Failed to mint NFT. Please try again.');
      toast.error('Failed to mint NFT');
    } finally {
      setIsMinting(false);
      setMintingStep('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-lg w-full">
        <div 
          ref={cardRef}
          className="bg-gradient-to-br from-yellow-400 via-purple-500 to-pink-500 p-1 rounded-2xl"
        >
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
                Promraw ERC7007
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <img 
                  src={userDrawing} 
                  alt="User Drawing" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  Original
                </span>
              </div>
              <div className="relative">
                <img 
                  src={aiImage} 
                  alt="AI Generated" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  AI Enhanced
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Prompt</h3>
                <p className="text-white/80 text-sm">{prompt}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">AI Score</h3>
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
                    {score}/100
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Rarity</h3>
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
                    {score >= 90 ? 'Legendary' : score >= 70 ? 'Rare' : 'Common'}
                  </p>
                </div>
              </div>
            </div>

            {(web3Error || mintError || mintingStep) && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                mintingStep ? 'bg-blue-500/10 border border-blue-500/20 text-blue-200' :
                'bg-red-500/10 border border-red-500/20 text-red-200'
              }`}>
                {mintingStep || web3Error || mintError}
              </div>
            )}

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={downloadCard}
                disabled={isMinting}
                className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Card
              </button>
              <button
                onClick={handleMint}
                disabled={isMinting || isConnecting}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-lg text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMinting || isConnecting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    {isConnecting ? 'Connecting...' : 'Minting...'}
                  </>
                ) : (
                  address ? 'Mint NFT' : 'Connect Wallet'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTCard;