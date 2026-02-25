import { useState } from "react";
import { Search, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useListMyTransactions } from "../hooks/useQueries";
import TransactionRow from "../components/TransactionRow";
import { formatCoins } from "../lib/utils";

const BONUS_TYPES = ["adminBonus", "firstUserDiscount", "referralBonus", "limitedDiscount", "cashback", "loyaltyReward", "festivalCampaign"];

function getTypeKey(type: any): string {
  return typeof type === "object" ? Object.keys(type)[0] : (type as string);
}

export default function TransactionHistory() {
  const { data: transactions, isLoading } = useListMyTransactions();
  const [search, setSearch] = useState("");

  const sorted = (transactions || []).sort((a: any, b: any) => {
    const ta = typeof a.createdAt === "bigint" ? Number(a.createdAt) : a.createdAt;
    const tb = typeof b.createdAt === "bigint" ? Number(b.createdAt) : b.createdAt;
    return tb - ta;
  });

  const filtered = sorted.filter((tx: any) =>
    tx.description?.toLowerCase().includes(search.toLowerCase())
  );

  const wins = filtered.filter((tx: any) => getTypeKey(tx.transactionType) === "win");
  const purchases = filtered.filter((tx: any) => getTypeKey(tx.transactionType) === "buy_ticket");
  const deposits = filtered.filter((tx: any) => getTypeKey(tx.transactionType) === "add_balance");
  const withdrawals = filtered.filter((tx: any) => getTypeKey(tx.transactionType) === "withdraw");
  const bonuses = filtered.filter((tx: any) => BONUS_TYPES.includes(getTypeKey(tx.transactionType)));

  const totalWinnings = wins.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
  const totalSpent = purchases.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
  const totalBonuses = bonuses.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);

  const renderList = (list: any[]) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No transactions found.</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {list.map((tx: any) => <TransactionRow key={tx.id} transaction={tx} />)}
      </div>
    );
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <History className="w-8 h-8 text-primary" />
        Transaction History
      </h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Winnings</p>
          <p className="font-bold text-green-500">{formatCoins(totalWinnings)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Spent</p>
          <p className="font-bold text-destructive">{formatCoins(totalSpent)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Bonuses</p>
          <p className="font-bold text-amber-400">{formatCoins(totalBonuses)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
          <TabsTrigger value="wins">Wins ({wins.length})</TabsTrigger>
          <TabsTrigger value="purchases">Purchases ({purchases.length})</TabsTrigger>
          <TabsTrigger value="deposits">Deposits ({deposits.length})</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals ({withdrawals.length})</TabsTrigger>
          <TabsTrigger value="bonuses">Bonuses ({bonuses.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">{renderList(filtered)}</TabsContent>
        <TabsContent value="wins" className="mt-4">{renderList(wins)}</TabsContent>
        <TabsContent value="purchases" className="mt-4">{renderList(purchases)}</TabsContent>
        <TabsContent value="deposits" className="mt-4">{renderList(deposits)}</TabsContent>
        <TabsContent value="withdrawals" className="mt-4">{renderList(withdrawals)}</TabsContent>
        <TabsContent value="bonuses" className="mt-4">{renderList(bonuses)}</TabsContent>
      </Tabs>
    </main>
  );
}
