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
import {
  useListAllPromotions,
  useAdminCreditUser,
  useDeactivatePromotion,
  useListAllUsers,
  useCreatePromotion,
  useUpdatePromotion,
  type UserProfile,
} from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';

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

  const activePromotions = (promotions || []).filter(isPromoActive);

  const handleGrantBonus = async () => {
    if (!bonusForm.userId) { toast.error('Please select a user'); return; }
    if (!bonusForm.amount || parseInt(bonusForm.amount) <= 0) { toast.error('Enter a valid amount'); return; }
    if (!bonusForm.description.trim()) { toast.error('Description is required'); return; }

    const selectedUser = (users || []).find((u: UserProfile) => u.id === bonusForm.userId);
    if (!selectedUser) { toast.error('User not found'); return; }

    try {
      await grantBonus.mutateAsync({
        userId: Principal.fromText(selectedUser.id),
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
      await createPromotion.mutateAsync({
        promoType: { [createForm.promoType]: null },
        description: createForm.description.trim(),
        discountPercent: createForm.discountPercent ? [BigInt(createForm.discountPercent)] : [],
        bonusAmount: createForm.bonusAmount ? [BigInt(createForm.bonusAmount)] : [],
        startTime: BigInt(startMs) * BigInt(1_000_000),
        endTime: endMs ? [BigInt(endMs) * BigInt(1_000_000)] : [],
        isActive: true,
      });
      toast.success('Promotion created!');
      setShowCreate(false);
      setCreateForm({ promoType: 'adminBonus', description: '', discountPercent: '', bonusAmount: '', startTime: '', endTime: '' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create promotion');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPromo) return;
    try {
      await updatePromotion.mutateAsync({
        id: editPromo.id,
        data: {
          description: editPromo.description,
          isActive: editPromo.isActive,
        },
      });
      toast.success('Promotion updated!');
      setEditPromo(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update promotion');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Gift className="w-7 h-7 text-primary" />
            Promotions & Bonuses
          </h1>
          <p className="text-muted-foreground mt-1">Manage bonus campaigns and promotional offers</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Promotion
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">New Promotion</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Promotion Type</Label>
                <select
                  value={createForm.promoType}
                  onChange={(e) => setCreateForm((p) => ({ ...p, promoType: e.target.value }))}
                  className="w-full h-9 rounded-md border border-border bg-background text-foreground px-3 text-sm"
                >
                  {PROMO_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Description *</Label>
                <Input
                  value={createForm.description}
                  onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Discount % (optional)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={createForm.discountPercent}
                  onChange={(e) => setCreateForm((p) => ({ ...p, discountPercent: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Bonus Amount (optional)</Label>
                <Input
                  type="number"
                  min={1}
                  value={createForm.bonusAmount}
                  onChange={(e) => setCreateForm((p) => ({ ...p, bonusAmount: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Start Time</Label>
                <Input
                  type="datetime-local"
                  value={createForm.startTime}
                  onChange={(e) => setCreateForm((p) => ({ ...p, startTime: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">End Time (optional)</Label>
                <Input
                  type="datetime-local"
                  value={createForm.endTime}
                  onChange={(e) => setCreateForm((p) => ({ ...p, endTime: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createPromotion.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {createPromotion.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="border-border text-foreground">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Active Promotions */}
      {activePromotions.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-3">🔥 Active Promotions ({activePromotions.length})</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {activePromotions.map((promo: any) => (
              <div key={promo.id} className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-primary">{getPromoTypeLabel(promo.promoType)}</span>
                  <Badge className="bg-green-600 text-xs">Active</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{promo.description}</p>
                {promo.discountPercent?.[0] && (
                  <p className="text-xs text-green-400 mt-1">{Number(promo.discountPercent[0])}% discount</p>
                )}
                {promo.bonusAmount?.[0] && (
                  <p className="text-xs text-green-400 mt-1">+{Number(promo.bonusAmount[0])} bonus coins</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grant Bonus Coins */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          Grant Bonus Coins
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-foreground">Select User *</Label>
            {usersLoading ? (
              <Skeleton className="h-10" />
            ) : (
              <Select value={bonusForm.userId} onValueChange={(v) => setBonusForm((f) => ({ ...f, userId: v }))}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {(users || []).map((u: UserProfile) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email || u.id.slice(0, 8)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Bonus Amount (coins) *</Label>
            <Input
              type="number"
              min={1}
              placeholder="e.g. 100"
              value={bonusForm.amount}
              onChange={(e) => setBonusForm((f) => ({ ...f, amount: e.target.value }))}
              className="bg-background border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Description *</Label>
            <Input
              placeholder="Reason for bonus..."
              value={bonusForm.description}
              onChange={(e) => setBonusForm((f) => ({ ...f, description: e.target.value }))}
              className="bg-background border-border text-foreground"
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
            <><Gift className="w-4 h-4 mr-2" />Grant Bonus</>
          )}
        </Button>
      </div>

      {/* All Promotions Table */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          All Promotions
        </h2>
        {promoLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : !promotions || promotions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-border rounded-xl">
            <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No promotions created yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Discount / Bonus</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo: any) => {
                  const active = isPromoActive(promo);
                  return (
                    <TableRow key={promo.id} className={active ? 'bg-primary/5' : ''}>
                      <TableCell>
                        <span className="text-sm font-medium">{getPromoTypeLabel(promo.promoType)}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {promo.description}
                      </TableCell>
                      <TableCell className="text-sm">
                        {promo.discountPercent?.[0] ? `${Number(promo.discountPercent[0])}% off` : ''}
                        {promo.bonusAmount?.[0] ? `+${Number(promo.bonusAmount[0])} coins` : ''}
                        {!promo.discountPercent?.[0] && !promo.bonusAmount?.[0] ? '—' : ''}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatTime(promo.startTime)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {promo.endTime?.[0] ? formatTime(promo.endTime[0]) : 'No end'}
                      </TableCell>
                      <TableCell>
                        {active ? (
                          <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditPromo(promo)}
                            className="h-7 w-7 p-0 border-border"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          {promo.isActive && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeactivate(promo.id)}
                              disabled={deactivate.isPending}
                              className="h-7 w-7 p-0"
                            >
                              <Power className="w-3 h-3" />
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

      {/* Edit inline form */}
      {editPromo && (
        <div className="bg-card border border-primary/30 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Edit Promotion</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Description</Label>
              <Input
                value={editPromo.description}
                onChange={(e) => setEditPromo((p: any) => ({ ...p, description: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={editPromo.isActive}
                  onChange={(e) => setEditPromo((p: any) => ({ ...p, isActive: e.target.checked }))}
                  className="rounded"
                />
                Active
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={updatePromotion.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {updatePromotion.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditPromo(null)} className="border-border text-foreground">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
