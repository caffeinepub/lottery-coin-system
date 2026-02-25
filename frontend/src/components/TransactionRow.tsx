import { Trophy, ArrowDownCircle, ArrowUpCircle, Ticket, Gift, Tag, Percent, Star, Zap, Sparkles, ExternalLink } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { formatCoins } from "../lib/utils";

interface TransactionRowProps {
  transaction: any;
}

function getTransactionMeta(type: any): {
  icon: React.ReactNode;
  label: string;
  amountClass: string;
  sign: string;
} {
  const key = typeof type === "object" ? Object.keys(type)[0] : type;
  switch (key) {
    case "win":
      return {
        icon: <Trophy className="w-5 h-5 text-yellow-500" />,
        label: "Prize Win",
        amountClass: "text-green-500 font-bold",
        sign: "+",
      };
    case "add_balance":
      return {
        icon: <ArrowDownCircle className="w-5 h-5 text-green-500" />,
        label: "Balance Added",
        amountClass: "text-green-500 font-semibold",
        sign: "+",
      };
    case "buy_ticket":
      return {
        icon: <Ticket className="w-5 h-5 text-blue-400" />,
        label: "Ticket Purchase",
        amountClass: "text-destructive font-semibold",
        sign: "-",
      };
    case "withdraw":
      return {
        icon: <ArrowUpCircle className="w-5 h-5 text-orange-400" />,
        label: "Withdrawal",
        amountClass: "text-orange-400 font-semibold",
        sign: "-",
      };
    case "adminBonus":
      return {
        icon: <Gift className="w-5 h-5 text-amber-400" />,
        label: "Admin Bonus",
        amountClass: "text-amber-400 font-semibold",
        sign: "+",
      };
    case "firstUserDiscount":
      return {
        icon: <Tag className="w-5 h-5 text-green-400" />,
        label: "First User Discount",
        amountClass: "text-green-400 font-semibold",
        sign: "+",
      };
    case "referralBonus":
      return {
        icon: <Star className="w-5 h-5 text-blue-400" />,
        label: "Referral Bonus",
        amountClass: "text-blue-400 font-semibold",
        sign: "+",
      };
    case "limitedDiscount":
      return {
        icon: <Percent className="w-5 h-5 text-red-400" />,
        label: "Limited Discount",
        amountClass: "text-red-400 font-semibold",
        sign: "+",
      };
    case "cashback":
      return {
        icon: <Zap className="w-5 h-5 text-purple-400" />,
        label: "Cashback Reward",
        amountClass: "text-purple-400 font-semibold",
        sign: "+",
      };
    case "loyaltyReward":
      return {
        icon: <Trophy className="w-5 h-5 text-yellow-400" />,
        label: "Loyalty Reward",
        amountClass: "text-yellow-400 font-semibold",
        sign: "+",
      };
    case "festivalCampaign":
      return {
        icon: <Sparkles className="w-5 h-5 text-pink-400" />,
        label: "Festival Bonus",
        amountClass: "text-pink-400 font-semibold",
        sign: "+",
      };
    default:
      return {
        icon: <ArrowDownCircle className="w-5 h-5 text-muted-foreground" />,
        label: key || "Transaction",
        amountClass: "text-foreground",
        sign: "",
      };
  }
}

function formatDate(ts: bigint | number) {
  const ms = typeof ts === "bigint" ? Number(ts) / 1_000_000 : ts;
  return new Date(ms).toLocaleString();
}

export default function TransactionRow({ transaction }: TransactionRowProps) {
  const navigate = useNavigate();
  const meta = getTransactionMeta(transaction.transactionType);
  const typeKey = typeof transaction.transactionType === "object"
    ? Object.keys(transaction.transactionType)[0]
    : transaction.transactionType;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
      <div className="shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm text-foreground">{meta.label}</p>
          {typeKey === "win" && transaction.lotteryPoolId && (
            <button
              onClick={() => navigate({ to: "/results/$lotteryId", params: { lotteryId: transaction.lotteryPoolId } })}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              View Results
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{transaction.description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(transaction.createdAt)}</p>
      </div>
      <div className={`shrink-0 text-right ${meta.amountClass}`}>
        {meta.sign}{formatCoins(Number(transaction.amount))}
      </div>
    </div>
  );
}
