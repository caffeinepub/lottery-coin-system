import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

// ===== TYPES (local, matching backend) =====

export interface LotteryPool {
  id: string;
  name: string;
  lotteryType: any;
  drawInterval: any;
  ticketPrice: bigint;
  maxTickets: bigint;
  ticketsPerUserMax: bigint;
  drawTime: bigint;
  status: any;
  totalTicketsSold: bigint;
  totalPoolAmount: bigint;
  description: string;
  logo: [] | [any];
  firstPrizeRatio: bigint;
  secondPrizeRatio: bigint;
  thirdPrizeRatio: bigint;
  createdAt: bigint;
}

export interface Ticket {
  id: string;
  userId: any;
  lotteryPoolId: string;
  ticketNumber: bigint;
  purchaseTime: bigint;
  isWinner: boolean;
  prizeAmount: bigint;
}

export interface WalletTransaction {
  id: string;
  userId: any;
  transactionType: any;
  amount: bigint;
  lotteryPoolId: [] | [string];
  ticketId: [] | [string];
  description: string;
  createdAt: bigint;
}

export interface BalanceRequest {
  id: string;
  userId: any;
  amount: bigint;
  paymentScreenshotUrl: string;
  status: any;
  adminNotes: [] | [string];
  createdAt: bigint;
  updatedAt: bigint;
}

export interface Withdrawal {
  id: string;
  userId: any;
  amount: bigint;
  upiId: [] | [string];
  bankDetails: [] | [string];
  status: any;
  adminNotes: [] | [string];
  createdAt: bigint;
  updatedAt: bigint;
}

export interface WinnerRecord {
  username: string;
  rank: bigint;
  ticketNumber: bigint;
  prizeAmount: bigint;
}

export interface DrawResult {
  winningNumber: bigint;
  totalTickets: bigint;
  totalPrizeDistributed: bigint;
  drawTime: bigint;
  winners: WinnerRecord[];
}

export interface LotteryLiveStats {
  ticketsSold: bigint;
  remainingTickets: bigint;
  totalPoolAmount: bigint;
  drawTime: bigint;
  currentStatus: any;
}

export interface DashboardStats {
  totalRevenue: bigint;
  totalActiveUsers: bigint;
  activeLotteryPoolsCount: bigint;
  pendingApprovalsCount: bigint;
}

export interface Promotion {
  id: string;
  promoType: any;
  description: string;
  discountPercent: [] | [bigint];
  bonusAmount: [] | [bigint];
  startTime: bigint;
  endTime: [] | [bigint];
  isActive: boolean;
  createdBy: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  coinsBalance: bigint;
  createdAt: bigint;
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
  blockedAt?: bigint;
  referralCode: string;
}

export interface AdminActionLog {
  id: string;
  adminPrincipal: any;
  targetUserId: any;
  action: any;
  reason: [] | [string];
  timestamp: bigint;
}

// ===== USER PROFILE =====

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile() as Promise<UserProfile | null>;
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// ===== LOTTERY POOLS =====

export function useListActiveLotteryPools() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LotteryPool[]>({
    queryKey: ['activeLotteryPools'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).listActiveLotteryPools();
        return result || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useListAllLotteryPools() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LotteryPool[]>({
    queryKey: ['allLotteryPools'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).listAllLotteryPools();
        return result || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useGetLotteryPool(poolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LotteryPool | null>({
    queryKey: ['lotteryPool', poolId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await (actor as any).getLotteryPool(poolId);
        return result?.[0] ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!poolId,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useGetLotteryLiveStats(poolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LotteryLiveStats | null>({
    queryKey: ['lotteryLiveStats', poolId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await (actor as any).getLotteryLiveStats(poolId);
        return result?.[0] ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!poolId,
    retry: 1,
    refetchInterval: 30_000,
  });
}

// ===== TICKETS =====

export function useListMyTickets() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Ticket[]>({
    queryKey: ['myTickets'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).listMyTickets();
        return result || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useListTicketsForPool(poolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Ticket[]>({
    queryKey: ['ticketsForPool', poolId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).listMyTicketsForPool(poolId);
        return result || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!poolId,
    retry: 1,
    staleTime: 30_000,
  });
}

// Alias for backward compatibility
export const useListTicketsForLottery = useListTicketsForPool;

export function useBuyTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ poolId, ticketNumber }: { poolId: string; ticketNumber: number }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).buyTicket(poolId, BigInt(ticketNumber));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
      queryClient.invalidateQueries({ queryKey: ['activeLotteryPools'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['lotteryLiveStats'] });
      queryClient.invalidateQueries({ queryKey: ['ticketsForPool'] });
    },
  });
}

// ===== TRANSACTIONS =====

export function useListMyTransactions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WalletTransaction[]>({
    queryKey: ['myTransactions'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).listMyTransactions();
        return result || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });
}

// ===== BALANCE REQUESTS =====

export function useSubmitBalanceRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, paymentScreenshotUrl }: { amount: number; paymentScreenshotUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).submitBalanceRequest(BigInt(amount), paymentScreenshotUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBalanceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['allBalanceRequests'] });
    },
  });
}

export function useListMyBalanceRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BalanceRequest[]>({
    queryKey: ['myBalanceRequests'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).listMyBalanceRequests();
        return result || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useListAllBalanceRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BalanceRequest[]>({
    queryKey: ['allBalanceRequests'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).listAllBalanceRequests();
        return result || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });
}

// Alias for backward compat
export const useListPendingBalanceRequests = useListAllBalanceRequests;

export function useApproveBalanceRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).approveBalanceRequest(requestId, notes ? [notes] : []);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBalanceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myBalanceRequests'] });
    },
  });
}

export function useRejectBalanceRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).rejectBalanceRequest(requestId, notes ? [notes] : []);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBalanceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myBalanceRequests'] });
    },
  });
}

// ===== WITHDRAWALS =====

export function useSubmitWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, upiId, bankDetails }: { amount: number; upiId?: string; bankDetails?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).submitWithdrawal(
        BigInt(amount),
        upiId ? [upiId] : [],
        bankDetails ? [bankDetails] : []
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myWithdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Alias for backward compat
export const useRequestWithdrawal = useSubmitWithdrawal;

export function useListMyWithdrawals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Withdrawal[]>({
    queryKey: ['myWithdrawals'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).listMyWithdrawals();
        return result || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useListAllWithdrawals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Withdrawal[]>({
    queryKey: ['allWithdrawals'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).listAllWithdrawals();
        return result || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useApproveWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ withdrawalId, notes }: { withdrawalId: string; notes?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).approveWithdrawal(withdrawalId, notes ? [notes] : []);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allWithdrawals'] });
    },
  });
}

export function useRejectWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ withdrawalId, notes }: { withdrawalId: string; notes?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).rejectWithdrawal(withdrawalId, notes ? [notes] : []);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allWithdrawals'] });
    },
  });
}

// ===== DRAW RESULTS =====

export function useGetDrawResult(poolId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DrawResult | null>({
    queryKey: ['drawResult', poolId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await (actor as any).getDrawResult(poolId);
        return result?.[0] ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!poolId,
    retry: 1,
    staleTime: 60_000,
  });
}

export function useDeclareDraw() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ poolId, winningNumber }: { poolId: string; winningNumber: number }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).declareDraw(poolId, BigInt(winningNumber));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLotteryPools'] });
      queryClient.invalidateQueries({ queryKey: ['activeLotteryPools'] });
      queryClient.invalidateQueries({ queryKey: ['drawResult'] });
    },
  });
}

// ===== ADMIN STATS =====

export function useGetDashboardStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DashboardStats | null>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await (actor as any).getDashboardStats();
        return result ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });
}

// ===== LOTTERY MANAGEMENT =====

export function useCreateLotteryPool() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createLotteryPool(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLotteryPools'] });
      queryClient.invalidateQueries({ queryKey: ['activeLotteryPools'] });
    },
  });
}

export function useUpdateLotteryPool() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ poolId, data }: { poolId: string; data: any }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateLotteryPool(poolId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLotteryPools'] });
      queryClient.invalidateQueries({ queryKey: ['activeLotteryPools'] });
    },
  });
}

// ===== PROMOTIONS =====

export function useListAllPromotions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Promotion[]>({
    queryKey: ['allPromotions'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).listAllPromotions();
        return result || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });
}

// Alias for backward compat
export const useListPromotions = useListAllPromotions;

export function useGetActivePromotions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Promotion[]>({
    queryKey: ['activePromotions'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).listActivePromotions();
        return result || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useCreatePromotion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createPromotion(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPromotions'] });
      queryClient.invalidateQueries({ queryKey: ['activePromotions'] });
    },
  });
}

export function useUpdatePromotion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updatePromotion(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPromotions'] });
      queryClient.invalidateQueries({ queryKey: ['activePromotions'] });
    },
  });
}

export function useDeactivatePromotion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promotionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deactivatePromotion(promotionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPromotions'] });
      queryClient.invalidateQueries({ queryKey: ['activePromotions'] });
    },
  });
}

export function useTogglePromotion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ promotionId, isActive }: { promotionId: string; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).togglePromotion(promotionId, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPromotions'] });
      queryClient.invalidateQueries({ queryKey: ['activePromotions'] });
    },
  });
}

// ===== USER MANAGEMENT =====

export function useListAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).listAllUsers();
        return result || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: any; role: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).assignCallerUserRole(userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useBlockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: any; reason?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).blockUser(userId, reason ? [reason] : []);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminActionLogs'] });
    },
  });
}

export function useUnblockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: any }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).unblockUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminActionLogs'] });
    },
  });
}

export function useAdminCreditUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: any; amount: number; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).adminCreditUser(userId, BigInt(amount), description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

// Alias for backward compat
export const useGrantAdminBonus = useAdminCreditUser;

export function useListAdminActionLogs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AdminActionLog[]>({
    queryKey: ['adminActionLogs'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as any).listAdminActionLogs();
        return result || [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });
}
