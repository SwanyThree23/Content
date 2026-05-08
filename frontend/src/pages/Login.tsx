import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

export function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });

  const loginMutation = useMutation({
    mutationFn: async () => {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister
        ? { email: form.email, password: form.password, fullName: form.fullName }
        : { email: form.email, password: form.password };
      return api.post(endpoint, payload);
    },
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.token);
      toast.success(isRegister ? 'Account created!' : 'Welcome back!');
      navigate('/dashboard');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Authentication failed');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">SwanyBot Live</h1>
          <p className="text-gray-500 mt-1">{isRegister ? 'Create your account' : 'Sign in to your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <Input
              label="Full Name"
              type="text"
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              required
            />
          )}
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Loading...' : isRegister ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsRegister(v => !v)}
            className="text-blue-600 hover:underline font-medium"
          >
            {isRegister ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </Card>
    </div>
  );
}
