import React, { useState } from 'react';
import { useListAllWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from '@/hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function WithdrawalManagement() {
  const { data: withdrawals, isLoading, error } = useListAllWithdrawals();
  const approveMutation = useApproveWithdrawal();
  const rejectMutation = useRejectWithdrawal();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('pending');

  const filtered = withdrawals?.filter((w) => {
    if (filter === 'all') return true;
    return Object.keys(w.status)[0] === filter;
  }) || [];

  const getStatusLabel = (status: any) => Object.keys(status)[0] || 'unknown';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Withdrawal Management</h1>
        <p className="text-muted-foreground">Process user withdrawal requests</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 text-destructive text-sm">
          Failed to load withdrawals. Please refresh.
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'pending', 'completed', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Clock size={40} className="mx-auto mb-3 opacity-40" />
          <p>No {filter === 'all' ? '' : filter} withdrawals found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((wd) => {
            const status = getStatusLabel(wd.status);
            const isPending = status === 'pending';
            return (
              <div key={wd.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{Number(wd.amount).toLocaleString()} coins</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      User: {wd.userId?.toString?.()?.slice(0, 20)}...
                    </div>
                    {wd.upiId?.[0] && <div className="text-xs text-muted-foreground">UPI: {wd.upiId[0]}</div>}
                    {wd.bankDetails?.[0] && <div className="text-xs text-muted-foreground">Bank: {wd.bankDetails[0]}</div>}
                    {wd.adminNotes?.[0] && <div className="text-xs text-muted-foreground mt-1">Notes: {wd.adminNotes[0]}</div>}
                  </div>
                  {isPending && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <Input
                        placeholder="Admin notes (optional)"
                        value={notes[wd.id] || ''}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [wd.id]: e.target.value }))}
                        className="text-xs h-8 w-48 bg-background border-border"
                      />
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate({ withdrawalId: wd.id, notes: notes[wd.id] })}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectMutation.mutate({ withdrawalId: wd.id, notes: notes[wd.id] })}
                        disabled={rejectMutation.isPending}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs"
                      >
                        <XCircle size={14} className="mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
