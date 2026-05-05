// Direct payment system: PayPal, CashApp, Venmo, Zelle, Chime
// 90% creator / 10% platform fee model (no gifts, no virtual currency)

import type { PaymentMethodType, FeeCalculation, PaymentMethod } from './types';

export const PAYMENT_CONFIGS: Record<PaymentMethodType, {
  name: string;
  icon: string;
  color: string;
  urlTemplate: string;
  handlePrefix: string;
  handleExample: string;
  supportsAmounts: boolean;
}> = {
  paypal: {
    name: 'PayPal',
    icon: 'paypal',
    color: '#0070ba',
    urlTemplate: 'https://paypal.me/{handle}/{amount}',
    handlePrefix: '',
    handleExample: 'yourname',
    supportsAmounts: true,
  },
  cashapp: {
    name: 'Cash App',
    icon: 'cashapp',
    color: '#00d632',
    urlTemplate: 'https://cash.app/{handle}/{amount}',
    handlePrefix: '$',
    handleExample: '$YourCashtag',
    supportsAmounts: true,
  },
  venmo: {
    name: 'Venmo',
    icon: 'venmo',
    color: '#3d95ce',
    urlTemplate: 'https://venmo.com/{handle}?txn=pay&amount={amount}&note={note}',
    handlePrefix: '@',
    handleExample: '@yourhandle',
    supportsAmounts: true,
  },
  zelle: {
    name: 'Zelle',
    icon: 'zelle',
    color: '#6d1ed4',
    urlTemplate: 'https://enroll.zellepay.com/qr-codes?data={handle}',
    handlePrefix: '',
    handleExample: 'phone or email',
    supportsAmounts: false,
  },
  chime: {
    name: 'Chime',
    icon: 'chime',
    color: '#1ec677',
    urlTemplate: 'https://www.chime.com/pay/{handle}',
    handlePrefix: '',
    handleExample: 'yourchimeid',
    supportsAmounts: false,
  },
};

// 90% creator model
export function calculateFee(amount_cents: number): FeeCalculation {
  const platform_fee_cents = Math.round(amount_cents * 0.10);
  const creator_receives_cents = amount_cents - platform_fee_cents;
  return {
    amount_cents,
    platform_fee_cents,
    creator_receives_cents,
    creator_pct: 0.90,
    platform_pct: 0.10,
  };
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Build payment deep-link URL
export function buildPaymentUrl(
  method: PaymentMethod,
  amount_cents?: number,
  note?: string
): string {
  const config = PAYMENT_CONFIGS[method.method_type];
  const handle = method.handle.replace(/^[@$]/, '');
  const amount = amount_cents ? (amount_cents / 100).toFixed(2) : '';
  const encodedNote = note ? encodeURIComponent(note) : '';

  return config.urlTemplate
    .replace('{handle}', handle)
    .replace('{amount}', amount)
    .replace('{note}', encodedNote);
}

// Suggested tip amounts
export const SUGGESTED_AMOUNTS_CENTS = [100, 200, 500, 1000, 2000, 5000];

export function getSuggestedAmounts() {
  return SUGGESTED_AMOUNTS_CENTS.map((cents) => ({
    cents,
    display: formatCents(cents),
    creator_receives: formatCents(calculateFee(cents).creator_receives_cents),
  }));
}
