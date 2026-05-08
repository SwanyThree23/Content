import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Search, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import api from '../lib/api';
import toast from 'react-hot-toast';

export function Documents() {
  const qc = useQueryClient();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.get('/documents').then(r => r.data.documents)
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      return api.post('/documents/upload', {
        name: file.name,
        text,
        fileSize: file.size
      });
    },
    onSuccess: () => {
      toast.success('Document uploaded and processing...');
      qc.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: () => toast.error('Upload failed')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => {
      toast.success('Document deleted');
      qc.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  const searchMutation = useMutation({
    mutationFn: () => api.post('/documents/query', { query }).then(r => r.data.results),
    onSuccess: (data) => setResults(data)
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Documents</h1>
        <label className="cursor-pointer">
          <Button icon={<Upload size={18} />} disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
          </Button>
          <input type="file" accept=".txt,.md,.pdf" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      <Card>
        <div className="flex gap-3">
          <Input
            placeholder="Search your documents with AI..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchMutation.mutate()}
          />
          <Button
            icon={<Search size={18} />}
            onClick={() => searchMutation.mutate()}
            disabled={!query || searchMutation.isPending}
          >
            Search
          </Button>
        </div>
        {results.length > 0 && (
          <div className="mt-4 space-y-3">
            {results.map((r, i) => (
              <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm">{r.content}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="space-y-3">
        {isLoading && <p className="text-gray-500">Loading documents...</p>}
        {(!data || data.length === 0) && !isLoading && (
          <Card>
            <div className="text-center py-8 text-gray-500">
              <FileText size={40} className="mx-auto mb-3 opacity-40" />
              <p>No documents yet. Upload a text file to get started.</p>
            </div>
          </Card>
        )}
        {(data || []).map((doc: any) => (
          <Card key={doc.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-blue-600" />
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-500">
                    {doc.chunk_count ? `${doc.chunk_count} chunks` : 'Processing...'} ·{' '}
                    {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : ''}
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 size={16} />}
                onClick={() => deleteMutation.mutate(doc.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
