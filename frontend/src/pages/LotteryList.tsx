import { useState } from "react";
import { Search, RefreshCw, Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useListActiveLotteryPools } from "../hooks/useQueries";
import LotteryCard from "../components/LotteryCard";
import { drawIntervalLabel } from "../lib/utils";

const INTERVAL_FILTERS = [
  { key: "all", label: "All" },
  { key: "h1", label: "1h" },
  { key: "h3", label: "3h" },
  { key: "h5", label: "5h" },
  { key: "h12", label: "12h" },
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
];

export default function LotteryList() {
  const { data: lotteries, isLoading, refetch } = useListActiveLotteryPools();
  const [search, setSearch] = useState("");
  const [intervalFilter, setIntervalFilter] = useState("all");

  const getIntervalKey = (interval: any): string => {
    if (!interval) return "";
    return typeof interval === "object" ? Object.keys(interval)[0] : interval;
  };

  const filtered = (lotteries || []).filter((lottery: any) => {
    const matchesSearch =
      lottery.name?.toLowerCase().includes(search.toLowerCase()) ||
      lottery.description?.toLowerCase().includes(search.toLowerCase());
    const matchesInterval =
      intervalFilter === "all" || getIntervalKey(lottery.drawInterval) === intervalFilter;
    return matchesSearch && matchesInterval;
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Ticket className="w-8 h-8 text-primary" />
            Active Lotteries
          </h1>
          <p className="text-muted-foreground mt-1">Choose your lottery and try your luck!</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search lotteries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {INTERVAL_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setIntervalFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                intervalFilter === f.key
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-border rounded-2xl">
          <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No lotteries found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lottery: any) => (
            <LotteryCard key={lottery.id} lottery={lottery} />
          ))}
        </div>
      )}
    </main>
  );
}
