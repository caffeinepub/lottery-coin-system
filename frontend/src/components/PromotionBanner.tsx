import { Gift, Tag, Percent, Trophy, Star, Zap, Sparkles } from "lucide-react";

interface PromotionBannerProps {
  promoType: string;
  discountPercent?: number;
  bonusAmount?: number;
  description: string;
  endTime?: bigint;
}

function getPromoIcon(type: string) {
  switch (type) {
    case "adminBonus": return <Gift className="w-5 h-5" />;
    case "firstUserDiscount": return <Tag className="w-5 h-5" />;
    case "referralBonus": return <Star className="w-5 h-5" />;
    case "limitedDiscount": return <Percent className="w-5 h-5" />;
    case "cashback": return <Zap className="w-5 h-5" />;
    case "loyaltyReward": return <Trophy className="w-5 h-5" />;
    case "festivalCampaign": return <Sparkles className="w-5 h-5" />;
    default: return <Gift className="w-5 h-5" />;
  }
}

function getPromoLabel(type: string) {
  switch (type) {
    case "adminBonus": return "Admin Bonus";
    case "firstUserDiscount": return "First User Discount";
    case "referralBonus": return "Referral Bonus";
    case "limitedDiscount": return "Limited Time Discount";
    case "cashback": return "Cashback Offer";
    case "loyaltyReward": return "Loyalty Reward";
    case "festivalCampaign": return "Festival Campaign";
    default: return "Special Offer";
  }
}

function getPromoColors(type: string) {
  switch (type) {
    case "adminBonus": return "border-amber-500/40 bg-amber-500/10 text-amber-400";
    case "firstUserDiscount": return "border-green-500/40 bg-green-500/10 text-green-400";
    case "referralBonus": return "border-blue-500/40 bg-blue-500/10 text-blue-400";
    case "limitedDiscount": return "border-red-500/40 bg-red-500/10 text-red-400";
    case "cashback": return "border-purple-500/40 bg-purple-500/10 text-purple-400";
    case "loyaltyReward": return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
    case "festivalCampaign": return "border-pink-500/40 bg-pink-500/10 text-pink-400";
    default: return "border-primary/40 bg-primary/10 text-primary";
  }
}

export default function PromotionBanner({
  promoType,
  discountPercent,
  bonusAmount,
  description,
  endTime,
}: PromotionBannerProps) {
  const typeKey = typeof promoType === "object" ? Object.keys(promoType as any)[0] : promoType;
  const colors = getPromoColors(typeKey);
  const label = getPromoLabel(typeKey);
  const icon = getPromoIcon(typeKey);

  const formatEndTime = (t: bigint) => {
    const ms = Number(t) / 1_000_000;
    return new Date(ms).toLocaleDateString();
  };

  return (
    <div className={`rounded-xl border-2 p-4 flex items-start gap-3 ${colors}`}>
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm">{label}</span>
          {discountPercent !== undefined && discountPercent > 0 && (
            <span className="text-xs font-bold bg-current/20 px-2 py-0.5 rounded-full opacity-90">
              {discountPercent}% OFF
            </span>
          )}
          {bonusAmount !== undefined && bonusAmount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full opacity-90">
              +{bonusAmount} Bonus Coins
            </span>
          )}
        </div>
        <p className="text-xs mt-1 opacity-80">{description}</p>
        {endTime && (
          <p className="text-xs mt-1 opacity-60">Valid until: {formatEndTime(endTime)}</p>
        )}
      </div>
    </div>
  );
}
