import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '../../config/pinecone';
import { supabase } from '../../config/database';

export async function processDocument(documentId: string, userId: string, text: string) {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
  const chunks = await splitter.createDocuments([text]);

  const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
  const index = pinecone.Index(process.env.PINECONE_INDEX!);

  await PineconeStore.fromDocuments(chunks, embeddings, {
    pineconeIndex: index,
    namespace: userId,
    textKey: 'text'
  });

  await supabase.from('documents').update({
    chunk_count: chunks.length,
    pinecone_namespace: userId,
    processed_at: new Date().toISOString()
  }).eq('id', documentId);
}
