import express from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { supabase } from '../config/database';
import { processDocument } from '../services/rag/processor';

const router = express.Router();

router.get('/', authenticateUser, async (req: AuthRequest, res) => {
  const { data, error } = await supabase
    .from('documents')
    .select('id, name, chunk_count, processed_at, created_at, file_size')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ documents: data });
});

router.post('/upload', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { name, text, fileSize } = req.body;

    const { data: doc, error } = await supabase
      .from('documents')
      .insert({
        user_id: req.user!.id,
        name,
        file_size: fileSize,
        status: 'processing'
      })
      .select()
      .single();

    if (error) throw error;

    // Process asynchronously
    processDocument(doc.id, req.user!.id, text).catch(console.error);

    res.status(201).json({ document: doc });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/query', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { query } = req.body;
    const { OpenAIEmbeddings } = await import('langchain/embeddings/openai');
    const { PineconeStore } = await import('langchain/vectorstores/pinecone');
    const { pinecone } = await import('../config/pinecone');

    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
    const index = pinecone.Index(process.env.PINECONE_INDEX!);

    const store = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: req.user!.id
    });

    const results = await store.similaritySearch(query, 5);
    res.json({ results: results.map(r => ({ content: r.pageContent, metadata: r.metadata })) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateUser, async (req: AuthRequest, res) => {
  await supabase
    .from('documents')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id);
  res.json({ success: true });
});

export default router;
