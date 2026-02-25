import React, { useState } from 'react';
import { useListAllLotteryPools, useCreateLotteryPool, useUpdateLotteryPool } from '@/hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trophy, Edit } from 'lucide-react';

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

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function LotteryManagement() {
  const { data: pools, isLoading, error } = useListAllLotteryPools();
  const createMutation = useCreateLotteryPool();
  const updateMutation = useUpdateLotteryPool();
  const [showCreate, setShowCreate] = useState(false);
  const [editPool, setEditPool] = useState<any>(null);

  const [form, setForm] = useState({
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
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
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
      });
      setShowCreate(false);
      setForm({ name: '', lotteryType: 'daily', drawInterval: 'daily', ticketPrice: '10', maxTickets: '100', ticketsPerUserMax: '5', drawTime: '', description: '', firstPrizeRatio: '60', secondPrizeRatio: '25', thirdPrizeRatio: '15' });
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
            <div className="space-y-2">
              <Label className="text-foreground">Name</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className="bg-background border-border text-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-foreground">Lottery Type</Label>
                <select value={form.lotteryType} onChange={(e) => setForm((p) => ({ ...p, lotteryType: e.target.value }))} className="w-full h-9 rounded-md border border-border bg-background text-foreground px-3 text-sm">
                  {LOTTERY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Draw Interval</Label>
                <select value={form.drawInterval} onChange={(e) => setForm((p) => ({ ...p, drawInterval: e.target.value }))} className="w-full h-9 rounded-md border border-border bg-background text-foreground px-3 text-sm">
                  {DRAW_INTERVALS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-foreground">Ticket Price</Label>
                <Input type="number" value={form.ticketPrice} onChange={(e) => setForm((p) => ({ ...p, ticketPrice: e.target.value }))} required className="bg-background border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Max Tickets</Label>
                <Input type="number" value={form.maxTickets} onChange={(e) => setForm((p) => ({ ...p, maxTickets: e.target.value }))} required className="bg-background border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Per User Max</Label>
                <Input type="number" value={form.ticketsPerUserMax} onChange={(e) => setForm((p) => ({ ...p, ticketsPerUserMax: e.target.value }))} required className="bg-background border-border text-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Draw Time</Label>
              <Input type="datetime-local" value={form.drawTime} onChange={(e) => setForm((p) => ({ ...p, drawTime: e.target.value }))} required className="bg-background border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Description</Label>
              <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="bg-background border-border text-foreground" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-foreground">1st Prize %</Label>
                <Input type="number" value={form.firstPrizeRatio} onChange={(e) => setForm((p) => ({ ...p, firstPrizeRatio: e.target.value }))} className="bg-background border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">2nd Prize %</Label>
                <Input type="number" value={form.secondPrizeRatio} onChange={(e) => setForm((p) => ({ ...p, secondPrizeRatio: e.target.value }))} className="bg-background border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">3rd Prize %</Label>
                <Input type="number" value={form.thirdPrizeRatio} onChange={(e) => setForm((p) => ({ ...p, thirdPrizeRatio: e.target.value }))} className="bg-background border-border text-foreground" />
              </div>
            </div>
            <Button type="submit" disabled={createMutation.isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : 'Create Lottery'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
