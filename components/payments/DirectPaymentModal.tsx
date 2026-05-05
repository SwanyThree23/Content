'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PAYMENT_CONFIGS,
  calculateFee,
  formatCents,
  buildPaymentUrl,
  SUGGESTED_AMOUNTS_CENTS,
} from '@/lib/payments';
import type { PaymentMethod, PaymentMethodType } from '@/lib/types';

const paymentSchema = z.object({
  amount_cents: z.number().min(100, 'Minimum $1.00').max(100000, 'Maximum $1,000'),
  message: z.string().max(200).optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface DirectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  paymentMethods: PaymentMethod[];
  sessionId?: string;
}

const METHOD_ICONS: Record<PaymentMethodType, React.ReactNode> = {
  paypal: <span className="font-bold text-lg">PP</span>,
  cashapp: <span className="font-bold text-lg">$</span>,
  venmo: <span className="font-bold text-lg">V</span>,
  zelle: <span className="font-bold text-lg">Z</span>,
  chime: <span className="font-bold text-lg">Ch</span>,
};

export function DirectPaymentModal({
  isOpen,
  onClose,
  recipientName,
  paymentMethods,
  sessionId,
}: DirectPaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    paymentMethods.find((m) => m.is_primary) || paymentMethods[0] || null
  );
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [step, setStep] = useState<'select' | 'confirm' | 'done'>('select');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount_cents: 500 },
  });

  const amountCents = watch('amount_cents');
  const fee = amountCents ? calculateFee(amountCents) : null;

  const handleAmountSelect = useCallback(
    (cents: number) => {
      setSelectedAmount(cents);
      setValue('amount_cents', cents);
    },
    [setValue]
  );

  const onSubmit = useCallback(
    (data: PaymentFormData) => {
      if (!selectedMethod) return;
      const url = buildPaymentUrl(selectedMethod, data.amount_cents, data.message);
      window.open(url, '_blank', 'noopener,noreferrer');
      setStep('done');
    },
    [selectedMethod]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4 border border-gray-700 shadow-2xl"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {step === 'done' ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Payment Initiated!</h3>
              <p className="text-gray-400 text-sm mb-4">
                Complete your payment in the {selectedMethod ? PAYMENT_CONFIGS[selectedMethod.method_type].name : ''} app.
              </p>
              <p className="text-gray-500 text-xs mb-6">
                {recipientName} receives {fee ? formatCents(fee.creator_receives_cents) : ''} directly.
                No platform middleman.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl font-bold">Support {recipientName}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-green-400 text-sm font-medium mb-4">
                Direct payment — 90% goes to {recipientName}. No gifts. No virtual coins.
              </p>

              {/* Payment method selector */}
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Pay via</label>
                <div className="grid grid-cols-5 gap-2">
                  {paymentMethods.map((method) => {
                    const config = PAYMENT_CONFIGS[method.method_type];
                    const isSelected = selectedMethod?.id === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                          isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500'
                        }`}
                        style={isSelected ? { borderColor: config.color } : {}}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: config.color }}
                        >
                          {METHOD_ICONS[method.method_type]}
                        </div>
                        <span className="text-gray-300 text-xs">{config.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Suggested amounts */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 block">Amount</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {SUGGESTED_AMOUNTS_CENTS.map((cents) => (
                      <button
                        key={cents}
                        type="button"
                        onClick={() => handleAmountSelect(cents)}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedAmount === cents
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {formatCents(cents)}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    placeholder="Custom amount (cents)"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                    {...register('amount_cents', { valueAsNumber: true })}
                    onChange={(e) => {
                      setSelectedAmount(null);
                      register('amount_cents').onChange(e);
                    }}
                  />
                  {errors.amount_cents && (
                    <p className="text-red-400 text-xs mt-1">{errors.amount_cents.message}</p>
                  )}
                </div>

                {/* Message */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 block">Message (optional)</label>
                  <textarea
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none resize-none"
                    rows={2}
                    placeholder="Send a message..."
                    {...register('message')}
                  />
                </div>

                {/* Fee breakdown */}
                {fee && (
                  <div className="bg-gray-800 rounded-lg p-3 mb-4 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Your payment</span>
                      <span>{formatCents(fee.amount_cents)}</span>
                    </div>
                    <div className="flex justify-between text-green-400 font-medium mt-1">
                      <span>{recipientName} receives (90%)</span>
                      <span>{formatCents(fee.creator_receives_cents)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 mt-1">
                      <span>Platform (10%)</span>
                      <span>{formatCents(fee.platform_fee_cents)}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedMethod}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
                  style={selectedMethod ? { backgroundColor: PAYMENT_CONFIGS[selectedMethod.method_type].color } : {}}
                >
                  {selectedMethod
                    ? `Pay via ${PAYMENT_CONFIGS[selectedMethod.method_type].name}`
                    : 'Select a payment method'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
