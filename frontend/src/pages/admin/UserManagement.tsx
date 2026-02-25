import React, { useState } from 'react';
import { useListAllUsers, useBlockUser, useUnblockUser, useAssignUserRole, useAdminCreditUser } from '@/hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Shield, Ban, CheckCircle, Coins } from 'lucide-react';
import { Principal } from '@dfinity/principal';

export default function UserManagement() {
  const { data: users, isLoading, error } = useListAllUsers();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const roleMutation = useAssignUserRole();
  const creditMutation = useAdminCreditUser();
  const [search, setSearch] = useState('');
  const [creditAmounts, setCreditAmounts] = useState<Record<string, string>>({});

  const filtered = users?.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts, roles, and balances</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 text-destructive text-sm">
          Failed to load users. Please refresh.
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border text-foreground"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users size={40} className="mx-auto mb-3 opacity-40" />
          <p>{search ? 'No users match your search' : 'No users found'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <div key={user.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{user.name || 'Unnamed'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {user.role}
                    </span>
                    {user.isBlocked && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">Blocked</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                    <span>{user.email || 'No email'}</span>
                    <span className="flex items-center gap-1"><Coins size={10} /> {Number(user.coinsBalance).toLocaleString()} coins</span>
                    <span className="font-mono">{user.id.slice(0, 20)}...</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Credit */}
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={creditAmounts[user.id] || ''}
                      onChange={(e) => setCreditAmounts((p) => ({ ...p, [user.id]: e.target.value }))}
                      className="w-20 h-7 text-xs bg-background border-border text-foreground"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const amount = parseInt(creditAmounts[user.id] || '0');
                        if (amount > 0) {
                          creditMutation.mutate({ userId: Principal.fromText(user.id), amount, description: 'Admin credit' });
                          setCreditAmounts((p) => ({ ...p, [user.id]: '' }));
                        }
                      }}
                      disabled={creditMutation.isPending}
                      className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Coins size={10} className="mr-1" />
                      Credit
                    </Button>
                  </div>
                  {/* Role Toggle */}
                  {user.role !== 'admin' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => roleMutation.mutate({ userId: Principal.fromText(user.id), role: 'admin' })}
                      disabled={roleMutation.isPending}
                      className="h-7 text-xs border-primary/50 text-primary hover:bg-primary/10"
                    >
                      <Shield size={10} className="mr-1" />
                      Make Admin
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => roleMutation.mutate({ userId: Principal.fromText(user.id), role: 'user' })}
                      disabled={roleMutation.isPending}
                      className="h-7 text-xs border-border text-muted-foreground hover:bg-accent"
                    >
                      Remove Admin
                    </Button>
                  )}
                  {/* Block/Unblock */}
                  {user.isBlocked ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => unblockMutation.mutate({ userId: Principal.fromText(user.id) })}
                      disabled={unblockMutation.isPending}
                      className="h-7 text-xs border-green-500/50 text-green-400 hover:bg-green-500/10"
                    >
                      <CheckCircle size={10} className="mr-1" />
                      Unblock
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => blockMutation.mutate({ userId: Principal.fromText(user.id) })}
                      disabled={blockMutation.isPending}
                      className="h-7 text-xs border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Ban size={10} className="mr-1" />
                      Block
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
