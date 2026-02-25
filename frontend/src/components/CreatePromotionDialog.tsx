import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreatePromotion } from "../hooks/useQueries";

const PROMO_TYPES = [
  { value: "adminBonus", label: "Admin Bonus" },
  { value: "firstUserDiscount", label: "First User Discount (90% off)" },
  { value: "referralBonus", label: "Referral Bonus" },
  { value: "limitedDiscount", label: "Limited Time Discount" },
  { value: "cashback", label: "Cashback Reward" },
  { value: "loyaltyReward", label: "Loyalty Reward" },
  { value: "festivalCampaign", label: "Festival / Event Campaign" },
];

interface CreatePromotionDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreatePromotionDialog({ open, onClose }: CreatePromotionDialogProps) {
  const createPromotion = useCreatePromotion();
  const [form, setForm] = useState({
    promoType: "",
    description: "",
    discountPercent: "",
    bonusAmount: "",
    startTime: "",
    endTime: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const needsDiscount = ["firstUserDiscount", "limitedDiscount", "cashback"].includes(form.promoType);
  const needsBonus = ["adminBonus", "referralBonus", "loyaltyReward", "festivalCampaign"].includes(form.promoType);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.promoType) e.promoType = "Please select a promotion type";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.startTime) e.startTime = "Start time is required";
    if (needsDiscount && !form.discountPercent) e.discountPercent = "Discount % is required";
    if (needsBonus && !form.bonusAmount) e.bonusAmount = "Bonus amount is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const startMs = new Date(form.startTime).getTime();
    const endMs = form.endTime ? new Date(form.endTime).getTime() : null;

    const data = {
      promoType: { [form.promoType]: null },
      description: form.description.trim(),
      discountPercent: form.discountPercent ? [parseInt(form.discountPercent)] : [],
      bonusAmount: form.bonusAmount ? [parseInt(form.bonusAmount)] : [],
      startTime: BigInt(startMs) * BigInt(1_000_000),
      endTime: endMs ? [BigInt(endMs) * BigInt(1_000_000)] : [],
      isActive: true,
    };

    try {
      await createPromotion.mutateAsync(data);
      toast.success("Promotion created successfully!");
      setForm({ promoType: "", description: "", discountPercent: "", bonusAmount: "", startTime: "", endTime: "" });
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create promotion");
    }
  };

  const handleClose = () => {
    setForm({ promoType: "", description: "", discountPercent: "", bonusAmount: "", startTime: "", endTime: "" });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Promotion</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Promotion Type *</Label>
            <Select value={form.promoType} onValueChange={(v) => setForm((f) => ({ ...f, promoType: v }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select promotion type" />
              </SelectTrigger>
              <SelectContent>
                {PROMO_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.promoType && <p className="text-xs text-destructive mt-1">{errors.promoType}</p>}
          </div>

          <div>
            <Label>Description *</Label>
            <Textarea
              className="mt-1 resize-none"
              rows={3}
              placeholder="Describe this promotion..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>

          {needsDiscount && (
            <div>
              <Label>Discount Percentage *</Label>
              <Input
                type="number"
                min={1}
                max={100}
                className="mt-1"
                placeholder="e.g. 90"
                value={form.discountPercent}
                onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
              />
              {errors.discountPercent && <p className="text-xs text-destructive mt-1">{errors.discountPercent}</p>}
            </div>
          )}

          {needsBonus && (
            <div>
              <Label>Bonus Coin Amount *</Label>
              <Input
                type="number"
                min={1}
                className="mt-1"
                placeholder="e.g. 100"
                value={form.bonusAmount}
                onChange={(e) => setForm((f) => ({ ...f, bonusAmount: e.target.value }))}
              />
              {errors.bonusAmount && <p className="text-xs text-destructive mt-1">{errors.bonusAmount}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date & Time *</Label>
              <Input
                type="datetime-local"
                className="mt-1"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              />
              {errors.startTime && <p className="text-xs text-destructive mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <Label>End Date & Time (optional)</Label>
              <Input
                type="datetime-local"
                className="mt-1"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={createPromotion.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createPromotion.isPending}>
            {createPromotion.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
            ) : (
              "Create Promotion"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
