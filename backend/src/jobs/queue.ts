import Bull from 'bull';
import { processDocument } from '../services/rag/processor';
import { sendEmail } from '../services/email';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const documentQueue = new Bull('documents', REDIS_URL);
export const emailQueue = new Bull('emails', REDIS_URL);

// Document processing worker
documentQueue.process(async (job) => {
  const { documentId, userId, text } = job.data;
  await processDocument(documentId, userId, text);
  return { processed: true };
});

// Email worker
emailQueue.process(async (job) => {
  await sendEmail(job.data);
  return { sent: true };
});

documentQueue.on('failed', (job, err) => {
  console.error(`Document job ${job.id} failed:`, err.message);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Email job ${job.id} failed:`, err.message);
});

export function addDocumentJob(data: { documentId: string; userId: string; text: string }) {
  return documentQueue.add(data, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
}

export function addEmailJob(data: any) {
  return emailQueue.add(data, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
}
