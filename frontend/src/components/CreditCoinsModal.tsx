import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Coins, Loader2 } from 'lucide-react';
import { useGrantAdminBonus } from '@/hooks/useQueries';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  coinsBalance: bigint;
}

interface CreditCoinsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
}

export default function CreditCoinsModal({ open, onOpenChange, user }: CreditCoinsModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const grantBonus = useGrantAdminBonus();

  const amountNum = parseInt(amount, 10);
  const isValidAmount = !isNaN(amountNum) && amountNum > 0 && Number.isInteger(amountNum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isValidAmount) return;

    try {
      await grantBonus.mutateAsync({
        userId: user.id,
        amount: amountNum,
        description: description.trim() || 'Admin bonus credit',
      });
      toast.success(`✅ ${amountNum.toLocaleString()} coins credited to ${user.name}!`, {
        style: { background: '#16a34a', color: '#fff', border: 'none' },
      });
      setAmount('');
      setDescription('');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(`Failed to credit coins: ${err?.message || 'Unknown error'}`, {
        style: { background: '#dc2626', color: '#fff', border: 'none' },
      });
    }
  };

  const handleCancel = () => {
    setAmount('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Coins size={16} className="text-amber-500" />
            </div>
            Add Coins
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Credit coins to{' '}
            <span className="font-semibold text-foreground">{user?.name || 'this user'}</span>
            {user?.email ? ` (${user.email})` : ''}.
            Current balance:{' '}
            <span className="font-semibold text-amber-500">
              {Number(user?.coinsBalance ?? 0).toLocaleString()} coins
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="coin-amount" className="text-foreground text-sm font-medium">
              Coin Amount <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Coins size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
              <Input
                id="coin-amount"
                type="number"
                min={1}
                step={1}
                placeholder="Enter amount (e.g. 500)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 bg-background border-border text-foreground"
                autoFocus
              />
            </div>
            {amount && !isValidAmount && (
              <p className="text-xs text-destructive">Please enter a positive whole number.</p>
            )}
          </div>

          {/* Quick amount buttons */}
          <div className="flex flex-wrap gap-2">
            {[100, 250, 500, 1000, 2500].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  amount === String(preset)
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'border-border text-muted-foreground hover:border-amber-500/50 hover:text-amber-500'
                }`}
              >
                +{preset.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coin-description" className="text-foreground text-sm font-medium">
              Reason / Description <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="coin-description"
              placeholder="e.g. Compensation for technical issue, loyalty reward..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="bg-background border-border text-foreground resize-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={grantBonus.isPending}
              className="border-border text-muted-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValidAmount || grantBonus.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            >
              {grantBonus.isPending ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Crediting…
                </>
              ) : (
                <>
                  <Coins size={14} className="mr-2" />
                  Credit {isValidAmount ? amountNum.toLocaleString() : ''} Coins
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
