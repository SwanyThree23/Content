import { initializePinecone } from './pinecone';

export async function initializeServices() {
  await initializePinecone();
  console.log('✓ Pinecone initialized');
  console.log('✓ All services ready');
}
