import { PineconeClient } from '@pinecone-database/pinecone';

export const pinecone = new PineconeClient();

export async function initializePinecone() {
  await pinecone.init({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENV!
  });
}
