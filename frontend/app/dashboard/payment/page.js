'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { completeMockPayment, createPaymentCheckout, getPaymentStatus } from '../../../services/payments.api';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(Boolean(searchParams.get('payment_return')));
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [annualAmount, setAnnualAmount] = useState(null);
  const [monthlyAmount, setMonthlyAmount] = useState(null);
  const [durationMonths, setDurationMonths] = useState(1);
  const [subscription, setSubscription] = useState(null);
  const [receivingNumber, setReceivingNumber] = useState('');
  const amountForPeriod = (months) => annualAmount ? Math.ceil((Number(annualAmount) / 12) * months) : null;
  const selectedAmount = amountForPeriod(durationMonths);

  useEffect(() => {
    if (user?.phone && !phoneNumber) setPhoneNumber(user.phone);
  }, [user, phoneNumber]);

  useEffect(() => {
    if (!user || checking) return;
    getPaymentStatus()
      .then((response) => {
        setAnnualAmount(response.data?.annualAmount || null);
        setMonthlyAmount(response.data?.monthlyAmount || null);
        setReceivingNumber(response.data?.receivingNumber || '');
        setSubscription(response.data?.subscription || null);
        const payment = response.data?.payment;
        if (payment) {
          if (payment.duration_months) setDurationMonths(Number(payment.duration_months));
          setPaymentStatus(payment.status || '');
          if (payment.status === 'pending') setChecking(true);
          if (payment.status === 'failed') setError('The last payment did not complete. You can try again.');
        }
      })
      .catch(() => {});
  }, [user, checking]);

  const continueToRegistration = () => router.replace('/dashboard/register-item');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!checking || !user) return undefined;

    let cancelled = false;
    let timeoutId;
    const checkPayment = async () => {
      try {
        const response = await getPaymentStatus();
        if (response.data?.annualAmount) setAnnualAmount(response.data.annualAmount);
        if (response.data?.monthlyAmount) setMonthlyAmount(response.data.monthlyAmount);
        if (response.data?.receivingNumber !== undefined) setReceivingNumber(response.data.receivingNumber);
        const payment = response.data?.payment;
        if (payment) {
          if (payment.duration_months) setDurationMonths(Number(payment.duration_months));
          setPaymentStatus(payment.status || '');
        }
        if (!cancelled && payment?.status === 'successful') {
          await fetchUser();
          continueToRegistration();
          return;
        }
        if (!cancelled && payment?.status === 'failed') {
          setChecking(false);
          setError('Paypack could not complete that payment. Check your mobile-money number and try again.');
          return;
        }
        if (!cancelled && !payment) {
          setChecking(false);
          setError('No payment request was found. Please start the payment again.');
          return;
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }

      if (!cancelled) timeoutId = setTimeout(checkPayment, 4000);
    };

    checkPayment();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [checking, user, fetchUser, router]);

  const beginPayment = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await createPaymentCheckout(phoneNumber, durationMonths);
      setAnnualAmount(response.data?.annualAmount || null);
      setMonthlyAmount(response.data?.monthlyAmount || (response.data?.annualAmount ? Math.ceil(response.data.annualAmount / 12) : null));
      setPaymentStatus(response.data?.payment?.status || 'pending');
      if (response.data.mode === 'mock') {
        await completeMockPayment(durationMonths);
        await fetchUser();
        continueToRegistration();
        return;
      }
      setChecking(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Subscription payment</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">Activate item registration</h1>
        <p className="mt-4 leading-7 text-slate-600">
          Choose how many months to pay for. Your subscription expiry is calculated from the selected period and shown after payment.
        </p>
        {annualAmount && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Annual fee</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{Number(annualAmount).toLocaleString()} RWF / year</p>
            {monthlyAmount && <p className="mt-1 text-sm text-slate-600">About {Number(monthlyAmount).toLocaleString()} RWF per month</p>}
          </div>
        )}
        <label className="mt-6 block text-sm font-semibold text-slate-700">
          Payment period
          <select value={durationMonths} onChange={(event) => setDurationMonths(Number(event.target.value))} disabled={checking} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200">
            {Array.from({ length: 12 }, (_, index) => index + 1).map((months) => (
              <option key={months} value={months}>{months} {months === 1 ? 'month' : 'months'}{amountForPeriod(months) !== null ? ` - ${amountForPeriod(months).toLocaleString()} RWF` : ''}</option>
            ))}
          </select>
        </label>
        <p className="mt-3 text-sm font-semibold text-slate-700" aria-live="polite">
          {selectedAmount !== null ? `Amount to pay: ${selectedAmount.toLocaleString()} RWF` : 'Loading payment amount…'}
        </p>
        {subscription?.expiresAt && <p className="mt-3 text-sm text-slate-600">Current subscription expires: {new Date(subscription.expiresAt).toLocaleDateString()}</p>}
        {receivingNumber && <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"><p className="font-bold">Payment receiving number</p><p className="mt-1 font-mono text-lg font-black">{receivingNumber}</p><p className="mt-1 text-xs">This is the platform’s configured mobile-money receiving contact. Your payment prompt is still processed securely through Paypack.</p></div>}

        {!checking && (
          <label className="mt-8 block text-sm font-semibold text-slate-700">
            Rwanda mobile-money number
            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="0781234567"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              required
            />
          </label>
        )}

        {checking ? (
          <div className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800" role="status" aria-live="polite">
            {paymentStatus === 'successful'
              ? 'Payment confirmed. Opening item registration…'
              : 'Payment request sent. Approve it on your phone; we will continue automatically after Paypack confirms it.'}
          </div>
        ) : (
          <button
            type="button"
            onClick={beginPayment}
            disabled={loading || !annualAmount}
            className="mt-8 w-full rounded-full bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Opening payment...' : annualAmount ? 'Pay selected period' : 'Loading price...'}
          </button>
        )}

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 w-full text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
