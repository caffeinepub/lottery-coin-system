import { useState } from "react";
import { Ticket, Trophy, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useListMyTickets, useListActiveLotteryPools } from "../hooks/useQueries";
import TicketCard from "../components/TicketCard";
import { formatCoins } from "../lib/utils";

export default function MyTickets() {
  const { data: tickets, isLoading: ticketsLoading } = useListMyTickets();
  const { data: lotteries } = useListActiveLotteryPools();

  const lotteryMap = (lotteries || []).reduce((acc: Record<string, string>, l: any) => {
    acc[l.id] = l.name;
    return acc;
  }, {});

  const allTickets = tickets || [];
  const wonTickets = allTickets.filter((t: any) => t.isWinner);
  const pendingTickets = allTickets.filter((t: any) => !t.isWinner);

  const totalWinnings = wonTickets.reduce(
    (sum: number, t: any) => sum + Number(t.prizeAmount),
    0
  );

  const renderTickets = (list: any[]) => {
    if (ticketsLoading) {
      return (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground border border-border rounded-2xl">
          <Ticket className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No tickets found.</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {list.map((ticket: any) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            lotteryName={lotteryMap[ticket.lotteryPoolId]}
          />
        ))}
      </div>
    );
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Ticket className="w-8 h-8 text-primary" />
        My Tickets
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Ticket className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-bold text-lg">{allTickets.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Won</p>
          <p className="font-bold text-lg text-yellow-500">{wonTickets.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Clock className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Winnings</p>
          <p className="font-bold text-sm text-green-500">{formatCoins(totalWinnings)}</p>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({allTickets.length})</TabsTrigger>
          <TabsTrigger value="won">Won ({wonTickets.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingTickets.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">{renderTickets(allTickets)}</TabsContent>
        <TabsContent value="won" className="mt-4">{renderTickets(wonTickets)}</TabsContent>
        <TabsContent value="pending" className="mt-4">{renderTickets(pendingTickets)}</TabsContent>
      </Tabs>
    </main>
  );
}
