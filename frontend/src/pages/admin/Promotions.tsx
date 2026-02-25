import React, { useState } from 'react';
import { Gift, Plus, Power, Edit, Loader2, Users, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
// Fix: import UserProfile from @/backend, not from useQueries (it's not exported there)
import type { UserProfile } from '@/backend';
import {
  useListAllPromotions,
  useAdminCreditUser,
  useDeactivatePromotion,
  useListAllUsers,
  useCreatePromotion,
  useUpdatePromotion,
} from '../../hooks/useQueries';

function formatTime(ns: bigint | number | undefined) {
  if (!ns) return '—';
  const ms = typeof ns === 'bigint' ? Number(ns) / 1_000_000 : ns;
  return new Date(ms).toLocaleDateString();
}

function getPromoTypeLabel(type: any) {
  const key = typeof type === 'object' ? Object.keys(type)[0] : type;
  const map: Record<string, string> = {
    adminBonus: 'Admin Bonus',
    firstUserDiscount: 'First User Discount',
    referralBonus: 'Referral Bonus',
    limitedDiscount: 'Limited Discount',
    cashback: 'Cashback',
    loyaltyReward: 'Loyalty Reward',
    festivalCampaign: 'Festival Campaign',
  };
  return map[key] || key;
}

function isPromoActive(promo: any): boolean {
  if (!promo.isActive) return false;
  const nowNs = Date.now() * 1_000_000;
  const start = typeof promo.startTime === 'bigint' ? Number(promo.startTime) : promo.startTime;
  if (nowNs < start) return false;
  if (promo.endTime?.[0]) {
    const end = typeof promo.endTime[0] === 'bigint' ? Number(promo.endTime[0]) : promo.endTime[0];
    return nowNs <= end;
  }
  return true;
}

const PROMO_TYPES = [
  { value: 'adminBonus', label: 'Admin Bonus' },
  { value: 'firstUserDiscount', label: 'First User Discount' },
  { value: 'referralBonus', label: 'Referral Bonus' },
  { value: 'limitedDiscount', label: 'Limited Discount' },
  { value: 'cashback', label: 'Cashback' },
  { value: 'loyaltyReward', label: 'Loyalty Reward' },
  { value: 'festivalCampaign', label: 'Festival Campaign' },
];

export default function Promotions() {
  const { data: promotions, isLoading: promoLoading } = useListAllPromotions();
  const { data: users, isLoading: usersLoading } = useListAllUsers();
  const grantBonus = useAdminCreditUser();
  const deactivate = useDeactivatePromotion();
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();

  const [showCreate, setShowCreate] = useState(false);
  const [editPromo, setEditPromo] = useState<any | null>(null);

  const [bonusForm, setBonusForm] = useState({ userId: '', amount: '', description: '' });
  const [createForm, setCreateForm] = useState({
    promoType: 'adminBonus',
    description: '',
    discountPercent: '',
    bonusAmount: '',
    startTime: '',
    endTime: '',
  });
  const [editForm, setEditForm] = useState({
    description: '',
    discountPercent: '',
    bonusAmount: '',
    startTime: '',
    endTime: '',
  });

  const activePromotions = (promotions || []).filter(isPromoActive);

  const handleGrantBonus = async () => {
    if (!bonusForm.userId) { toast.error('Please select a user'); return; }
    if (!bonusForm.amount || parseInt(bonusForm.amount) <= 0) { toast.error('Enter a valid amount'); return; }
    if (!bonusForm.description.trim()) { toast.error('Description is required'); return; }

    const selectedUser = (users || []).find((u: UserProfile) => u.id === bonusForm.userId);
    if (!selectedUser) { toast.error('User not found'); return; }

    try {
      // Fix: pass userId as string (selectedUser.id), not as Principal object
      await grantBonus.mutateAsync({
        userId: selectedUser.id,
        amount: parseInt(bonusForm.amount),
        description: bonusForm.description.trim(),
      });
      toast.success(`Bonus of ${bonusForm.amount} coins granted to ${selectedUser.name}!`);
      setBonusForm({ userId: '', amount: '', description: '' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to grant bonus');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivate.mutateAsync(id);
      toast.success('Promotion deactivated.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to deactivate');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.description.trim()) { toast.error('Description is required'); return; }
    try {
      const startMs = createForm.startTime ? new Date(createForm.startTime).getTime() : Date.now();
      const endMs = createForm.endTime ? new Date(createForm.endTime).getTime() : null;
      const data = {
        promoType: { [createForm.promoType]: null },
        description: createForm.description.trim(),
        discountPercent: createForm.discountPercent ? [parseInt(createForm.discountPercent)] : [],
        bonusAmount: createForm.bonusAmount ? [parseInt(createForm.bonusAmount)] : [],
        startTime: BigInt(startMs) * BigInt(1_000_000),
        endTime: endMs ? [BigInt(endMs) * BigInt(1_000_000)] : [],
        isActive: true,
      };
      await createPromotion.mutateAsync(data);
      toast.success('Promotion created!');
      setShowCreate(false);
      setCreateForm({ promoType: 'adminBonus', description: '', discountPercent: '', bonusAmount: '', startTime: '', endTime: '' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create promotion');
    }
  };

  const openEdit = (promo: any) => {
    setEditPromo(promo);
    const toLocal = (ns: bigint | undefined) => {
      if (!ns) return '';
      const ms = Number(ns) / 1_000_000;
      const d = new Date(ms);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setEditForm({
      description: promo.description || '',
      discountPercent: promo.discountPercent?.[0]?.toString() ?? '',
      bonusAmount: promo.bonusAmount?.[0]?.toString() ?? '',
      startTime: toLocal(promo.startTime),
      endTime: promo.endTime?.[0] ? toLocal(promo.endTime[0]) : '',
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPromo) return;
    if (!editForm.description.trim()) { toast.error('Description is required'); return; }
    try {
      const startMs = editForm.startTime ? new Date(editForm.startTime).getTime() : null;
      const endMs = editForm.endTime ? new Date(editForm.endTime).getTime() : null;
      const data = {
        description: editForm.description.trim(),
        discountPercent: editForm.discountPercent ? [parseInt(editForm.discountPercent)] : [],
        bonusAmount: editForm.bonusAmount ? [parseInt(editForm.bonusAmount)] : [],
        startTime: startMs ? BigInt(startMs) * BigInt(1_000_000) : editPromo.startTime,
        endTime: endMs ? [BigInt(endMs) * BigInt(1_000_000)] : [],
      };
      // Fix: use promotionId (not id) to match the hook's expected parameter shape
      await updatePromotion.mutateAsync({ promotionId: editPromo.id, data });
      toast.success('Promotion updated!');
      setEditPromo(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update promotion');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Gift className="w-7 h-7 text-primary" />
          Promotions
        </h1>
        <p className="text-muted-foreground mt-1">Manage promotions and grant bonuses to users</p>
      </div>

      {/* Grant Bonus Section */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          Grant Admin Bonus
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-foreground text-sm">Select User</Label>
            {usersLoading ? (
              <Skeleton className="h-9 mt-1" />
            ) : (
              <Select value={bonusForm.userId} onValueChange={(v) => setBonusForm((f) => ({ ...f, userId: v }))}>
                <SelectTrigger className="mt-1 bg-background border-border text-foreground">
                  <SelectValue placeholder="Choose user" />
                </SelectTrigger>
                <SelectContent>
                  {(users || []).map((u: UserProfile) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email || u.id.slice(0, 12) + '...'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Label className="text-foreground text-sm">Amount (coins)</Label>
            <Input
              type="number"
              min={1}
              placeholder="e.g. 100"
              value={bonusForm.amount}
              onChange={(e) => setBonusForm((f) => ({ ...f, amount: e.target.value }))}
              className="mt-1 bg-background border-border text-foreground"
            />
          </div>
          <div>
            <Label className="text-foreground text-sm">Description</Label>
            <Input
              placeholder="Reason for bonus"
              value={bonusForm.description}
              onChange={(e) => setBonusForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 bg-background border-border text-foreground"
            />
          </div>
        </div>
        <Button
          className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleGrantBonus}
          disabled={grantBonus.isPending}
        >
          {grantBonus.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Granting...</>
          ) : (
            <><Coins className="w-4 h-4 mr-2" />Grant Bonus</>
          )}
        </Button>
      </div>

      {/* Create Promotion */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Create Promotion
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreate((v) => !v)}
            className="border-border text-foreground"
          >
            {showCreate ? 'Cancel' : 'New Promotion'}
          </Button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground text-sm">Promotion Type *</Label>
                <Select value={createForm.promoType} onValueChange={(v) => setCreateForm((f) => ({ ...f, promoType: v }))}>
                  <SelectTrigger className="mt-1 bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMO_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground text-sm">Description *</Label>
                <Input
                  placeholder="Promotion description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground text-sm">Discount %</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="e.g. 10"
                  value={createForm.discountPercent}
                  onChange={(e) => setCreateForm((f) => ({ ...f, discountPercent: e.target.value }))}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground text-sm">Bonus Amount (coins)</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 50"
                  value={createForm.bonusAmount}
                  onChange={(e) => setCreateForm((f) => ({ ...f, bonusAmount: e.target.value }))}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground text-sm">Start Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={createForm.startTime}
                  onChange={(e) => setCreateForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground text-sm">End Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={createForm.endTime}
                  onChange={(e) => setCreateForm((f) => ({ ...f, endTime: e.target.value }))}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={createPromotion.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {createPromotion.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" />Create Promotion</>
              )}
            </Button>
          </form>
        )}
      </div>

      {/* Edit Promotion Inline */}
      {editPromo && (
        <div className="bg-card border border-primary/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              Edit Promotion: {editPromo.description}
            </h2>
            <Button variant="outline" size="sm" onClick={() => setEditPromo(null)} className="border-border text-foreground">
              Cancel
            </Button>
          </div>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-foreground text-sm">Description *</Label>
                <Input
                  placeholder="Promotion description"
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground text-sm">Discount %</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={editForm.discountPercent}
                  onChange={(e) => setEditForm((f) => ({ ...f, discountPercent: e.target.value }))}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground text-sm">Bonus Amount (coins)</Label>
                <Input
                  type="number"
                  min={1}
                  value={editForm.bonusAmount}
                  onChange={(e) => setEditForm((f) => ({ ...f, bonusAmount: e.target.value }))}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground text-sm">Start Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={editForm.startTime}
                  onChange={(e) => setEditForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground text-sm">End Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={editForm.endTime}
                  onChange={(e) => setEditForm((f) => ({ ...f, endTime: e.target.value }))}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={updatePromotion.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updatePromotion.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Promotions Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            All Promotions
          </h2>
          <Badge variant="secondary">{activePromotions.length} active</Badge>
        </div>

        {promoLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
          </div>
        ) : !promotions || promotions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Gift size={40} className="mx-auto mb-3 opacity-40" />
            <p>No promotions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Description</TableHead>
                  <TableHead className="text-muted-foreground">Discount</TableHead>
                  <TableHead className="text-muted-foreground">Bonus</TableHead>
                  <TableHead className="text-muted-foreground">Start</TableHead>
                  <TableHead className="text-muted-foreground">End</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo: any) => {
                  const active = isPromoActive(promo);
                  return (
                    <TableRow key={promo.id} className="border-border hover:bg-accent/30">
                      <TableCell className="text-foreground text-sm font-medium">
                        {getPromoTypeLabel(promo.promoType)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                        {promo.description}
                      </TableCell>
                      <TableCell className="text-foreground text-sm">
                        {promo.discountPercent?.[0] ? `${promo.discountPercent[0]}%` : '—'}
                      </TableCell>
                      <TableCell className="text-foreground text-sm">
                        {promo.bonusAmount?.[0] ? `${promo.bonusAmount[0]} coins` : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatTime(promo.startTime)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {promo.endTime?.[0] ? formatTime(promo.endTime[0]) : '∞'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={active ? 'default' : 'secondary'}>
                          {active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(promo)}
                            className="h-7 text-xs border-border text-foreground hover:bg-accent"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          {active && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeactivate(promo.id)}
                              disabled={deactivate.isPending}
                              className="h-7 text-xs border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <Power className="w-3 h-3 mr-1" />
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
