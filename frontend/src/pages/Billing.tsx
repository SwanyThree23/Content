import { useQuery, useMutation } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

export function Billing() {
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['plans'],
    queryFn: () => api.get('/stripe/plans').then(r => r.data.plans)
  });

  const checkoutMutation = useMutation({
    mutationFn: (priceId: string) =>
      api.post('/stripe/checkout', { priceId }).then(r => r.data),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => toast.error('Failed to start checkout')
  });

  const portalMutation = useMutation({
    mutationFn: () => api.post('/stripe/portal').then(r => r.data),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => toast.error('Failed to open billing portal')
  });

  const currentTier = (user as any)?.tier || 'free';

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-gray-500 mt-1">
            Current plan: <span className="font-semibold capitalize">{currentTier}</span>
          </p>
        </div>
        {currentTier !== 'free' && (
          <Button variant="secondary" onClick={() => portalMutation.mutate()} disabled={portalMutation.isPending}>
            Manage Subscription
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(data || []).map((plan: any) => {
          const isCurrent = currentTier === plan.id;
          return (
            <Card
              key={plan.id}
              className={isCurrent ? 'border-blue-500 ring-2 ring-blue-200' : ''}
            >
              {isCurrent && (
                <span className="inline-block bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full mb-3">
                  Current Plan
                </span>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={isCurrent ? 'secondary' : 'primary'}
                disabled={isCurrent || checkoutMutation.isPending}
                onClick={() => !isCurrent && checkoutMutation.mutate(plan.priceId)}
              >
                {isCurrent ? 'Current Plan' : 'Upgrade'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
