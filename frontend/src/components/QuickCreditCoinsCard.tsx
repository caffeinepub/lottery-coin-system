import React, { useState, useMemo } from 'react';
import { Coins, Search, X, Loader2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useListAllUsers, useGrantAdminBonus } from '@/hooks/useQueries';
import { toast } from 'sonner';

interface UserOption {
  id: string;
  name: string;
  email: string;
  coinsBalance: bigint;
}

export default function QuickCreditCoinsCard() {
  const { data: users } = useListAllUsers();
  const grantBonus = useGrantAdminBonus();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim() || !users) return [];
    const q = searchQuery.toLowerCase();
    return (users as UserOption[])
      .filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [users, searchQuery]);

  const amountNum = parseInt(amount, 10);
  const isValidAmount = !isNaN(amountNum) && amountNum > 0 && Number.isInteger(amountNum);
  const canSubmit = !!selectedUser && isValidAmount && !grantBonus.isPending;

  const handleSelectUser = (user: UserOption) => {
    setSelectedUser(user);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setSearchQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !isValidAmount) return;

    try {
      await grantBonus.mutateAsync({
        userId: selectedUser.id,
        amount: amountNum,
        description: description.trim() || 'Admin quick credit',
      });
      toast.success(`✅ ${amountNum.toLocaleString()} coins credited to ${selectedUser.name}!`, {
        style: { background: '#16a34a', color: '#fff', border: 'none' },
      });
      setSelectedUser(null);
      setAmount('');
      setDescription('');
      setSearchQuery('');
    } catch (err: any) {
      toast.error(`Failed to credit coins: ${err?.message || 'Unknown error'}`, {
        style: { background: '#dc2626', color: '#fff', border: 'none' },
      });
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Coins size={20} className="text-amber-500" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Quick Credit Coins</h2>
          <p className="text-xs text-muted-foreground">Instantly credit coins to any user</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Search */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Select User</Label>
          {selectedUser ? (
            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
              <div>
                <div className="text-sm font-semibold text-foreground">{selectedUser.name}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedUser.email} · {Number(selectedUser.coinsBalance).toLocaleString()} coins
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearUser}
                className="text-muted-foreground hover:text-foreground transition-colors ml-2"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                className="pl-8 bg-background border-border text-foreground text-sm"
              />
              {showDropdown && filteredUsers.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onMouseDown={() => handleSelectUser(user)}
                      className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                    >
                      <div className="text-sm font-medium text-foreground">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email} · {Number(user.coinsBalance).toLocaleString()} coins
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showDropdown && searchQuery.trim() && filteredUsers.length === 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg px-3 py-3 text-sm text-muted-foreground text-center">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Coin Amount</Label>
          <div className="relative">
            <Coins size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
            <Input
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 bg-background border-border text-foreground text-sm"
            />
          </div>
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {[100, 500, 1000, 2500].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className={`text-xs px-2.5 py-0.5 rounded-full border transition-all ${
                  amount === String(preset)
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'border-border text-muted-foreground hover:border-amber-500/50 hover:text-amber-500'
                }`}
              >
                +{preset.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">
            Reason <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            type="text"
            placeholder="e.g. Loyalty reward, compensation..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-background border-border text-foreground text-sm"
          />
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold disabled:opacity-50"
        >
          {grantBonus.isPending ? (
            <>
              <Loader2 size={14} className="mr-2 animate-spin" />
              Crediting…
            </>
          ) : (
            <>
              <Coins size={14} className="mr-2" />
              Credit Coins
              {isValidAmount && selectedUser ? ` (+${amountNum.toLocaleString()})` : ''}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
