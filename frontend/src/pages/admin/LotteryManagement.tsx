import React, { useState, useMemo } from 'react';
import { useListAllLotteryPools, useCreateLotteryPool, useUpdateLotteryPool } from '@/hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trophy, Edit, AlertCircle, Info } from 'lucide-react';

const DRAW_INTERVALS = [
  { value: 'h1', label: '1 Hour' },
  { value: 'h3', label: '3 Hours' },
  { value: 'h5', label: '5 Hours' },
  { value: 'h12', label: '12 Hours' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

const LOTTERY_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

const DEFAULT_FORM = {
  name: '',
  lotteryType: 'daily',
  drawInterval: 'daily',
  ticketPrice: '10',
  maxTickets: '100',
  ticketsPerUserMax: '5',
  drawTime: '',
  description: '',
  firstPrizeRatio: '60',
  secondPrizeRatio: '25',
  thirdPrizeRatio: '15',
  winnerPayoutPercent: '70',
  firstPrizePercent: '40',
  secondPrizePercent: '30',
  thirdPrizePercent: '20',
};

export default function LotteryManagement() {
  const { data: pools, isLoading, error } = useListAllLotteryPools();
  const createMutation = useCreateLotteryPool();
  const updateMutation = useUpdateLotteryPool();
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({ ...DEFAULT_FORM });

  // Derived validation
  const winnerPayout = parseInt(form.winnerPayoutPercent) || 0;
  const firstPct = parseInt(form.firstPrizePercent) || 0;
  const secondPct = parseInt(form.secondPrizePercent) || 0;
  const thirdPct = parseInt(form.thirdPrizePercent) || 0;
  const top3Sum = firstPct + secondPct + thirdPct;

  const payoutError = winnerPayout > 90 ? 'Winner payout cannot exceed 90% (system must retain at least 10%).' : null;
  const top3Error = top3Sum >= 100 ? 'Top-3 prize percentages must sum to less than 100%.' : null;

  // Calculated summary
  const summary = useMemo(() => {
    const ticketPrice = parseInt(form.ticketPrice) || 0;
    const maxTickets = parseInt(form.maxTickets) || 0;
    const totalPool = ticketPrice * maxTickets;
    const prizePool = Math.floor((totalPool * winnerPayout) / 100);
    const systemProfit = totalPool - prizePool;
    const first = Math.floor((prizePool * firstPct) / 100);
    const second = Math.floor((prizePool * secondPct) / 100);
    const third = Math.floor((prizePool * thirdPct) / 100);
    const remainingPct = Math.max(0, 100 - top3Sum);
    const remaining = prizePool - first - second - third;
    return { totalPool, prizePool, systemProfit, first, second, third, remainingPct, remaining };
  }, [form.ticketPrice, form.maxTickets, winnerPayout, firstPct, secondPct, thirdPct, top3Sum]);

  const isFormValid = !payoutError && !top3Error && form.name && form.drawTime;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    try {
      await createMutation.mutateAsync({
        name: form.name,
        lotteryType: { [form.lotteryType]: null },
        drawInterval: { [form.drawInterval]: null },
        ticketPrice: BigInt(form.ticketPrice),
        maxTickets: BigInt(form.maxTickets),
        ticketsPerUserMax: BigInt(form.ticketsPerUserMax),
        drawTime: BigInt(new Date(form.drawTime).getTime()) * BigInt(1_000_000),
        description: form.description,
        logo: [],
        firstPrizeRatio: BigInt(form.firstPrizeRatio),
        secondPrizeRatio: BigInt(form.secondPrizeRatio),
        thirdPrizeRatio: BigInt(form.thirdPrizeRatio),
        winnerPayoutPercent: BigInt(form.winnerPayoutPercent),
        firstPrizePercent: BigInt(form.firstPrizePercent),
        secondPrizePercent: BigInt(form.secondPrizePercent),
        thirdPrizePercent: BigInt(form.thirdPrizePercent),
      });
      setShowCreate(false);
      setForm({ ...DEFAULT_FORM });
    } catch (err) {
      console.error('Create lottery error:', err);
    }
  };

  const handleUpdateStatus = async (poolId: string, status: string) => {
    try {
      await updateMutation.mutateAsync({
        poolId,
        data: { name: [], ticketPrice: [], description: [], logo: [], status: [{ [status]: null }] },
      });
    } catch (err) {
      console.error('Update lottery error:', err);
    }
  };

  const getStatusLabel = (status: any) => Object.keys(status)[0] || 'unknown';
  const getIntervalLabel = (interval: any) => {
    const key = Object.keys(interval)[0] || '';
    return DRAW_INTERVALS.find((d) => d.value === key)?.label || key;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lottery Management</h1>
          <p className="text-muted-foreground">Create and manage lottery pools</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus size={16} className="mr-2" />
          Create Lottery
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 text-destructive text-sm">
          Failed to load lotteries. Please refresh.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : !pools || pools.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy size={40} className="mx-auto mb-3 opacity-40" />
          <p>No lottery pools yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pools.map((pool) => {
            const status = getStatusLabel(pool.status);
            const payoutPct = pool.winnerPayoutPercent !== undefined ? Number(pool.winnerPayoutPercent) : 70;
            const profitPct = 100 - payoutPct;
            return (
              <div key={pool.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{pool.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        status === 'active' ? 'bg-green-500/20 text-green-400' :
                        status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                      <span>Price: {Number(pool.ticketPrice)} coins</span>
                      <span>Max: {Number(pool.maxTickets)} tickets</span>
                      <span>Sold: {Number(pool.totalTicketsSold)}</span>
                      <span>Interval: {getIntervalLabel(pool.drawInterval)}</span>
                      <span className="text-primary/80">Winners: {payoutPct}% | Profit: {profitPct}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(pool.id, 'cancelled')}
                        disabled={updateMutation.isPending}
                        className="text-xs border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        Cancel
                      </Button>
                    )}
                    {status !== 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(pool.id, 'active')}
                        disabled={updateMutation.isPending}
                        className="text-xs border-green-500/50 text-green-400 hover:bg-green-500/10"
                      >
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create Lottery Pool</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label className="text-foreground">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-foreground">Lottery Type</Label>
                <select
                  value={form.lotteryType}
                  onChange={(e) => setForm((p) => ({ ...p, lotteryType: e.target.value }))}
                  className="w-full h-9 rounded-md border border-border bg-background text-foreground px-3 text-sm"
                >
                  {LOTTERY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Draw Interval</Label>
                <select
                  value={form.drawInterval}
                  onChange={(e) => setForm((p) => ({ ...p, drawInterval: e.target.value }))}
                  className="w-full h-9 rounded-md border border-border bg-background text-foreground px-3 text-sm"
                >
                  {DRAW_INTERVALS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-foreground">Ticket Price</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.ticketPrice}
                  onChange={(e) => setForm((p) => ({ ...p, ticketPrice: e.target.value }))}
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Max Tickets</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.maxTickets}
                  onChange={(e) => setForm((p) => ({ ...p, maxTickets: e.target.value }))}
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Per User Max</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.ticketsPerUserMax}
                  onChange={(e) => setForm((p) => ({ ...p, ticketsPerUserMax: e.target.value }))}
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Draw Time</Label>
              <Input
                type="datetime-local"
                value={form.drawTime}
                onChange={(e) => setForm((p) => ({ ...p, drawTime: e.target.value }))}
                required
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>

            {/* Prize Distribution Section */}
            <div className="border border-primary/30 rounded-xl p-4 space-y-4 bg-primary/5">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-primary" />
                <span className="font-semibold text-foreground text-sm">Prize Distribution</span>
              </div>

              {/* Winner Payout % */}
              <div className="space-y-1">
                <Label className="text-foreground">
                  Winner Payout %
                  <span className="ml-1 text-xs text-muted-foreground font-normal">(max 90%)</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="90"
                  value={form.winnerPayoutPercent}
                  onChange={(e) => setForm((p) => ({ ...p, winnerPayoutPercent: e.target.value }))}
                  className={`bg-background border-border text-foreground ${payoutError ? 'border-destructive' : ''}`}
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info size={11} />
                  System retains {100 - winnerPayout}% as profit. Max 90%.
                </p>
                {payoutError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle size={12} />
                    {payoutError}
                  </p>
                )}
              </div>

              {/* Top-3 Prize Percentages */}
              <div className="space-y-1">
                <Label className="text-foreground text-sm">
                  Top-3 Prize % <span className="text-xs text-muted-foreground font-normal">(% of prize fund, must sum &lt; 100)</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">🥇 1st Place %</Label>
                    <Input
                      type="number"
                      min="1"
                      max="98"
                      value={form.firstPrizePercent}
                      onChange={(e) => setForm((p) => ({ ...p, firstPrizePercent: e.target.value }))}
                      className={`bg-background border-border text-foreground ${top3Error ? 'border-destructive' : ''}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">🥈 2nd Place %</Label>
                    <Input
                      type="number"
                      min="1"
                      max="98"
                      value={form.secondPrizePercent}
                      onChange={(e) => setForm((p) => ({ ...p, secondPrizePercent: e.target.value }))}
                      className={`bg-background border-border text-foreground ${top3Error ? 'border-destructive' : ''}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">🥉 3rd Place %</Label>
                    <Input
                      type="number"
                      min="1"
                      max="98"
                      value={form.thirdPrizePercent}
                      onChange={(e) => setForm((p) => ({ ...p, thirdPrizePercent: e.target.value }))}
                      className={`bg-background border-border text-foreground ${top3Error ? 'border-destructive' : ''}`}
                    />
                  </div>
                </div>
                {top3Error && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle size={12} />
                    {top3Error}
                  </p>
                )}
                {!top3Error && (
                  <p className="text-xs text-muted-foreground">
                    Top-3 sum: {top3Sum}% — Remaining for other winners: {Math.max(0, 100 - top3Sum)}%
                  </p>
                )}
              </div>

              {/* Calculated Summary */}
              <div className="bg-background border border-border rounded-lg p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estimated Prize Summary</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <span className="text-muted-foreground">Total Pool (full):</span>
                  <span className="text-foreground font-medium text-right">{summary.totalPool} coins</span>

                  <span className="text-muted-foreground">System Profit ({100 - winnerPayout}%):</span>
                  <span className="text-amber-500 font-semibold text-right">{summary.systemProfit} coins</span>

                  <span className="text-muted-foreground">Prize Fund ({winnerPayout}%):</span>
                  <span className="text-primary font-medium text-right">{summary.prizePool} coins</span>

                  <span className="text-muted-foreground">🥇 1st Prize ({firstPct}%):</span>
                  <span className="text-yellow-500 font-semibold text-right">{summary.first} coins</span>

                  <span className="text-muted-foreground">🥈 2nd Prize ({secondPct}%):</span>
                  <span className="text-slate-300 font-semibold text-right">{summary.second} coins</span>

                  <span className="text-muted-foreground">🥉 3rd Prize ({thirdPct}%):</span>
                  <span className="text-orange-400 font-semibold text-right">{summary.third} coins</span>

                  <span className="text-muted-foreground">Other Winners ({summary.remainingPct}%):</span>
                  <span className="text-foreground font-medium text-right">{summary.remaining} coins (shared)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowCreate(false); setForm({ ...DEFAULT_FORM }); }}
                className="flex-1 border-border text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || createMutation.isPending}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Lottery'}
              </Button>
            </div>
            {createMutation.isError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle size={12} />
                Failed to create lottery. Please check your inputs and try again.
              </p>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
