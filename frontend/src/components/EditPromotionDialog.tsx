import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdatePromotion } from '../hooks/useQueries';

interface EditPromotionDialogProps {
  open: boolean;
  onClose: () => void;
  promotion: any | null;
}

function toDatetimeLocal(ns: bigint | undefined): string {
  if (!ns) return '';
  const ms = Number(ns) / 1_000_000;
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditPromotionDialog({ open, onClose, promotion }: EditPromotionDialogProps) {
  const updatePromotion = useUpdatePromotion();
  const [form, setForm] = useState({
    description: '',
    discountPercent: '',
    bonusAmount: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    if (promotion) {
      setForm({
        description: promotion.description || '',
        discountPercent: promotion.discountPercent?.[0]?.toString() ?? '',
        bonusAmount: promotion.bonusAmount?.[0]?.toString() ?? '',
        startTime: toDatetimeLocal(promotion.startTime),
        endTime: promotion.endTime?.[0] ? toDatetimeLocal(promotion.endTime[0]) : '',
      });
    }
  }, [promotion]);

  const handleSubmit = async () => {
    if (!promotion) return;
    if (!form.description.trim()) {
      toast.error('Description is required');
      return;
    }

    const startMs = form.startTime ? new Date(form.startTime).getTime() : null;
    const endMs = form.endTime ? new Date(form.endTime).getTime() : null;

    const data = {
      description: form.description.trim(),
      discountPercent: form.discountPercent ? [parseInt(form.discountPercent)] : [],
      bonusAmount: form.bonusAmount ? [parseInt(form.bonusAmount)] : [],
      startTime: startMs ? BigInt(startMs) * BigInt(1_000_000) : promotion.startTime,
      endTime: endMs ? [BigInt(endMs) * BigInt(1_000_000)] : [],
    };

    try {
      await updatePromotion.mutateAsync({ id: promotion.id, data });
      toast.success('Promotion updated successfully!');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update promotion');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Promotion</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-foreground">Description *</Label>
            <Textarea
              className="mt-1 resize-none bg-background border-border text-foreground"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div>
            <Label className="text-foreground">Discount Percentage</Label>
            <Input
              type="number"
              min={1}
              max={100}
              className="mt-1 bg-background border-border text-foreground"
              value={form.discountPercent}
              onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
            />
          </div>

          <div>
            <Label className="text-foreground">Bonus Coin Amount</Label>
            <Input
              type="number"
              min={1}
              className="mt-1 bg-background border-border text-foreground"
              value={form.bonusAmount}
              onChange={(e) => setForm((f) => ({ ...f, bonusAmount: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-foreground">Start Date & Time</Label>
              <Input
                type="datetime-local"
                className="mt-1 bg-background border-border text-foreground"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-foreground">End Date & Time</Label>
              <Input
                type="datetime-local"
                className="mt-1 bg-background border-border text-foreground"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updatePromotion.isPending} className="border-border text-foreground">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updatePromotion.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {updatePromotion.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
