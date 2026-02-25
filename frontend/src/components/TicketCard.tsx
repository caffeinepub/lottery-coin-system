import { Ticket, Trophy, ExternalLink } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { formatCoins, formatDate } from "../lib/utils";

interface TicketType {
  id: string;
  userId: any;
  lotteryPoolId: string;
  ticketNumber: number | bigint;
  purchaseTime: number | bigint;
  isWinner: boolean;
  prizeAmount: number | bigint;
}

interface TicketCardProps {
  ticket: TicketType;
  lotteryName?: string;
}

export default function TicketCard({ ticket, lotteryName }: TicketCardProps) {
  const navigate = useNavigate();

  const ticketNum = typeof ticket.ticketNumber === "bigint"
    ? Number(ticket.ticketNumber)
    : ticket.ticketNumber;

  const prize = typeof ticket.prizeAmount === "bigint"
    ? Number(ticket.prizeAmount)
    : ticket.prizeAmount;

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      ticket.isWinner
        ? "border-yellow-500/40 bg-yellow-500/5"
        : "border-border bg-card"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            ticket.isWinner ? "bg-yellow-500/20" : "bg-muted"
          }`}>
            {ticket.isWinner ? (
              <Trophy className="w-5 h-5 text-yellow-500" />
            ) : (
              <Ticket className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              #{String(ticketNum).padStart(6, "0")}
            </p>
            {lotteryName && (
              <p className="text-xs text-muted-foreground">{lotteryName}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDate(ticket.purchaseTime)}
            </p>
          </div>
        </div>

        <div className="text-right">
          {ticket.isWinner ? (
            <div>
              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 mb-1">
                Winner!
              </Badge>
              <p className="text-sm font-bold text-green-500">
                +{formatCoins(prize)}
              </p>
              <button
                onClick={() => navigate({ to: "/results/$lotteryId", params: { lotteryId: ticket.lotteryPoolId } })}
                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 ml-auto"
              >
                <ExternalLink className="w-3 h-3" />
                View Results
              </button>
            </div>
          ) : (
            <Badge variant="secondary">Pending</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
