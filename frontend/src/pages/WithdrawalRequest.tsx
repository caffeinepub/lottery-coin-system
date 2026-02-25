import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Wallet, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useSubmitWithdrawal, useListMyWithdrawals, useGetCallerUserProfile } from '../hooks/useQueries';
import { formatCoins, formatDate } from '../lib/utils';

const MIN_WITHDRAWAL = 500;

function getStatusBadge(status: any) {
  const key = typeof status === 'object' ? Object.keys(status)[0] : status;
  switch (key) {
    case 'pending':
      return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
    case 'completed':
      return <Badge className="bg-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Completed</Badge>;
    case 'rejected':
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
    default:
      return <Badge variant="outline">{key}</Badge>;
  }
}

export default function WithdrawalRequest() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: withdrawals, isLoading: withdrawalsLoading } = useListMyWithdrawals();
  const submitWithdrawal = useSubmitWithdrawal();

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState('');

  const balance = Number(userProfile?.coinsBalance ?? 0);
  const amountNum = parseInt(amount) || 0;
  const hasInsufficientBalance = amountNum > balance;
  const isBelowMin = amountNum > 0 && amountNum < MIN_WITHDRAWAL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountNum || amountNum < MIN_WITHDRAWAL) {
      toast.error(`Minimum withdrawal is ${MIN_WITHDRAWAL} coins`);
      return;
    }
    if (hasInsufficientBalance) {
      toast.error('Insufficient balance');
      return;
    }
    if (paymentMethod === 'upi' && !upiId.trim()) {
      toast.error('Please enter your UPI ID');
      return;
    }
    if (paymentMethod === 'bank' && !bankDetails.trim()) {
      toast.error('Please enter your bank details');
      return;
    }

    try {
      await submitWithdrawal.mutateAsync({
        amount: amountNum,
        upiId: paymentMethod === 'upi' ? upiId.trim() : undefined,
        bankDetails: paymentMethod === 'bank' ? bankDetails.trim() : undefined,
      });
      toast.success('Withdrawal request submitted!');
      setAmount('');
      setUpiId('');
      setBankDetails('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit withdrawal');
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/dashboard' })} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Wallet className="w-8 h-8 text-primary" />
          Withdraw Coins
        </h1>
        <p className="text-muted-foreground mt-1">
          Available balance: <span className="font-semibold text-foreground">{formatCoins(balance)}</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div>
          <Label>Amount (coins) *</Label>
          <Input
            type="number"
            min={MIN_WITHDRAWAL}
            className="mt-1"
            placeholder={`Minimum ${MIN_WITHDRAWAL} coins`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {isBelowMin && (
            <p className="text-xs text-destructive mt-1">Minimum withdrawal is {MIN_WITHDRAWAL} coins</p>
          )}
          {hasInsufficientBalance && !isBelowMin && (
            <p className="text-xs text-destructive mt-1">Insufficient balance</p>
          )}
        </div>

        <div>
          <Label>Payment Method *</Label>
          <div className="flex gap-3 mt-2">
            {(['upi', 'bank'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPaymentMethod(m)}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  paymentMethod === m
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {m === 'upi' ? 'UPI' : 'Bank Transfer'}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === 'upi' ? (
          <div>
            <Label>UPI ID *</Label>
            <Input
              className="mt-1"
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <Label>Bank Details *</Label>
            <Input
              className="mt-1"
              placeholder="Account number, IFSC, bank name..."
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
            />
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={submitWithdrawal.isPending || hasInsufficientBalance || isBelowMin}
        >
          {submitWithdrawal.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
          ) : (
            'Submit Withdrawal Request'
          )}
        </Button>
      </form>

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Withdrawal History</h2>
        {withdrawalsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : !withdrawals || withdrawals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-border rounded-xl">
            <p>No withdrawal requests yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div>
                  <p className="font-semibold text-sm">{formatCoins(Number(w.amount))}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(w.createdAt)}</p>
                  {w.adminNotes?.[0] && (
                    <p className="text-xs text-muted-foreground mt-1">Note: {w.adminNotes[0]}</p>
                  )}
                </div>
                {getStatusBadge(w.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
