import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export interface Web3State {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

const REQUIRED_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID);
const NETWORK_NAME = import.meta.env.VITE_NETWORK_NAME;

const ERC7007_ABI = [
  "function mint(string memory tokenURI) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

export const useWeb3 = () => {
  const [state, setState] = useState<Web3State>({
    provider: null,
    signer: null,
    address: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });

  const checkAndSwitchNetwork = async (provider: ethers.BrowserProvider) => {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    if (chainId !== REQUIRED_CHAIN_ID) {
      try {
        await window.ethereum?.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${REQUIRED_CHAIN_ID.toString(16)}` }],
        });
        return true;
      } catch (error: any) {
        if (error.code === 4902) {
          toast.error(`Please add ${NETWORK_NAME} to your wallet`);
        } else {
          toast.error(`Please switch to ${NETWORK_NAME}`);
        }
        return false;
      }
    }
    return true;
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: "Please install MetaMask to use this feature" }));
      toast.error("Please install MetaMask to use this feature");
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check network and switch if needed
      const networkValid = await checkAndSwitchNetwork(provider);
      if (!networkValid) {
        throw new Error(`Please switch to ${NETWORK_NAME}`);
      }

      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      
      setState({
        provider,
        signer,
        address: accounts[0],
        chainId: Number(network.chainId),
        isConnecting: false,
        error: null,
      });

      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      const errorMessage = error.message || "Failed to connect wallet. Please try again.";
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  };

  const mintNFT = async (tokenURI: string) => {
    if (!state.signer || !state.provider) {
      throw new Error("Wallet not connected");
    }

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error("Contract address not configured");
    }

    try {
      const contract = new ethers.Contract(
        contractAddress,
        ERC7007_ABI,
        state.signer
      );

      const tx = await contract.mint(tokenURI);
      const receipt = await tx.wait();
      
      // Get the token ID from the Transfer event
      const transferEvent = receipt.logs.find(
        (log: any) => log.topics[0] === ethers.id("Transfer(address,address,uint256)")
      );
      
      if (transferEvent) {
        const tokenId = ethers.getBigInt(transferEvent.topics[3]);
        toast.success(`NFT minted successfully! Token ID: ${tokenId}`);
      }

      return tx.hash;
    } catch (error: any) {
      console.error('Error minting NFT:', error);
      throw new Error(error.message || 'Failed to mint NFT');
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setState(prev => ({ ...prev, address: accounts[0] || null }));
        if (!accounts[0]) {
          toast.error('Wallet disconnected');
        }
      });

      window.ethereum.on('chainChanged', async (chainId: string) => {
        const newChainId = Number(chainId);
        setState(prev => ({ ...prev, chainId: newChainId }));
        
        if (newChainId !== REQUIRED_CHAIN_ID) {
          toast.error(`Please switch to ${NETWORK_NAME}`);
        }
      });

      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts[0]) {
            connectWallet();
          }
        });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  return {
    ...state,
    connectWallet,
    mintNFT,
  };
};