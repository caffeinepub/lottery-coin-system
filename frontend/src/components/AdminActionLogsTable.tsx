import React from 'react';
import { Shield, UserX, UserCheck, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useListAdminActionLogs } from '../hooks/useQueries';

function getActionBadge(action: any) {
  const key = typeof action === 'object' ? Object.keys(action)[0] : action;
  switch (key) {
    case 'block':
      return <Badge variant="destructive" className="flex items-center gap-1 w-fit"><UserX className="w-3 h-3" />Block</Badge>;
    case 'unblock':
      return <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1 w-fit"><UserCheck className="w-3 h-3" />Unblock</Badge>;
    case 'roleChange':
      return <Badge variant="secondary" className="flex items-center gap-1 w-fit"><RefreshCw className="w-3 h-3" />Role Change</Badge>;
    default:
      return <Badge variant="outline">{key}</Badge>;
  }
}

function formatTimestamp(ts: bigint | number) {
  const ms = typeof ts === 'bigint' ? Number(ts) / 1_000_000 : ts;
  return new Date(ms).toLocaleString();
}

export default function AdminActionLogsTable() {
  const { data: logs, isLoading } = useListAdminActionLogs();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No admin action logs yet.</p>
      </div>
    );
  }

  const sorted = [...logs].sort((a, b) => {
    const ta = typeof a.timestamp === 'bigint' ? Number(a.timestamp) : a.timestamp;
    const tb = typeof b.timestamp === 'bigint' ? Number(b.timestamp) : b.timestamp;
    return Number(tb) - Number(ta);
  });

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Admin</TableHead>
            <TableHead>Target User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Date & Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {log.adminPrincipal?.toString?.()?.slice(0, 12) ?? '—'}...
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {log.targetUserId?.toString?.()?.slice(0, 12) ?? '—'}...
              </TableCell>
              <TableCell>{getActionBadge(log.action)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {log.reason?.[0] || '—'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatTimestamp(log.timestamp)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
