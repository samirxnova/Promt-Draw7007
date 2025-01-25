import { NFTStorage, File } from 'nft.storage';

const client = new NFTStorage({ token: import.meta.env.VITE_NFT_STORAGE_KEY });

export const uploadToIPFS = async (
  imageBlob: Blob,
  name: string,
  description: string,
  attributes: Array<{ trait_type: string; value: string | number }>
) => {
  try {
    // Upload image to IPFS
    const imageFile = new File([imageBlob], 'nft.png', { type: 'image/png' });
    const metadata = await client.store({
      name,
      description,
      image: imageFile,
      attributes
    });

    return metadata.url;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload to IPFS');
  }
};