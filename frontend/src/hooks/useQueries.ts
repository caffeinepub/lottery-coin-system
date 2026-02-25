import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { useAuth } from '@/contexts/AuthContext';
import type {
  UserProfile,
  Variant_notFound_unauthorized,
} from '@/backend';

// Re-export WinnerRecord type for use in other components
export type WinnerRecord = {
  username: string;
  rank: bigint;
  ticketNumber: bigint;
  prizeAmount: bigint;
};

// ===== USER PROFILE =====

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.getCallerUserProfile();

      if (result && typeof result === 'object' && '__kind__' in result) {
        if (result.__kind__ === 'ok') {
          return (result as any).ok as UserProfile;
        } else {
          return null;
        }
      }
      return null;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ===== ADMIN LOGIN =====

export function useAdminLogin() {
  const { adminLogin } = useAuth();

  return useMutation({
    mutationFn: async ({ adminId, password }: { adminId: string; password: string }) => {
      const result = await adminLogin(adminId, password);
      if (!result.success) {
        throw new Error(result.error || 'Invalid admin credentials');
      }
      return result;
    },
  });
}

// ===== LOTTERY POOLS =====

export function useListActiveLotteryPools() {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ['activeLotteryPools'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listActiveLotteryPools();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListAllLotteryPools() {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ['allLotteryPools'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listAllLotteryPools();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLotteryPool(poolId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<any>({
    queryKey: ['lotteryPool', poolId],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getLotteryPool(poolId);
    },
    enabled: !!actor && !isFetching && !!poolId,
  });
}

export function useGetLotteryLiveStats(poolId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<any>({
    queryKey: ['lotteryLiveStats', poolId],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getLotteryLiveStats(poolId);
    },
    enabled: !!actor && !isFetching && !!poolId,
    refetchInterval: 15_000,
  });
}

export function useCreateLotteryPool() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createLotteryPool(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeLotteryPools'] });
      queryClient.invalidateQueries({ queryKey: ['allLotteryPools'] });
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
      queryClient.invalidateQueries({ queryKey: ['activeLotteryPools'] });
      queryClient.invalidateQueries({ queryKey: ['allLotteryPools'] });
    },
  });
}

// ===== TICKETS =====

export function useListMyTickets() {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ['myTickets'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listMyTickets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListTicketsForPool(poolId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ['ticketsForPool', poolId],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listTicketsForPool(poolId);
    },
    enabled: !!actor && !isFetching && !!poolId,
  });
}

// Alias
export const useListTicketsForLottery = useListTicketsForPool;

export function useBuyTicket() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ poolId, ticketNumber, promotionId }: { poolId: string; ticketNumber: number; promotionId?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).buyTicket(poolId, ticketNumber, promotionId ? [promotionId] : []);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
      queryClient.invalidateQueries({ queryKey: ['activeLotteryPools'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ===== TRANSACTIONS =====

export function useListMyTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ['myTransactions'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listMyTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

// ===== BALANCE REQUESTS =====

export function useSubmitBalanceRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount, paymentScreenshotUrl }: { amount: number; paymentScreenshotUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).submitBalanceRequest(amount, paymentScreenshotUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBalanceRequests'] });
    },
  });
}

export function useListMyBalanceRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ['myBalanceRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listMyBalanceRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListAllBalanceRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ['allBalanceRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listAllBalanceRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

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
      return (actor as any).submitWithdrawal(amount, upiId ? [upiId] : [], bankDetails ? [bankDetails] : []);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myWithdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Alias for backward compatibility
export const useRequestWithdrawal = useSubmitWithdrawal;

export function useListMyWithdrawals() {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ['myWithdrawals'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listMyWithdrawals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListAllWithdrawals() {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ['allWithdrawals'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listAllWithdrawals();
    },
    enabled: !!actor && !isFetching,
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

// ===== DRAWS =====

export function useGetDrawResult(poolId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<any>({
    queryKey: ['drawResult', poolId],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getDrawResult(poolId);
    },
    enabled: !!actor && !isFetching && !!poolId,
  });
}

export function useListAllDraws() {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ['allDraws'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listAllDraws();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeclareWinner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ poolId, winningNumber }: { poolId: string; winningNumber: number }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).declareWinner(poolId, winningNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDraws'] });
      queryClient.invalidateQueries({ queryKey: ['allLotteryPools'] });
      queryClient.invalidateQueries({ queryKey: ['activeLotteryPools'] });
    },
  });
}

// ===== ADMIN =====

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<any>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: any; role: any }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(userId, role);
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
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).blockUser(userId, reason ? [reason] : []);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useUnblockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).unblockUser(userId, reason ? [reason] : []);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useAdminCreditUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: string; amount: number; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).grantAdminBonus(userId, BigInt(amount), description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsersList'] });
    },
  });
}

// Alias — useGrantAdminBonus is the canonical name used by CreditCoinsModal and QuickCreditCoinsCard
export const useGrantAdminBonus = useAdminCreditUser;

// ===== PROMOTIONS =====

export function useListAllPromotions() {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ['allPromotions'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listAllPromotions();
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias
export const useListPromotions = useListAllPromotions;

export function useGetActivePromotions() {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ['activePromotions'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getActivePromotions();
    },
    enabled: !!actor && !isFetching,
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
    mutationFn: async ({ promotionId, data }: { promotionId: string; data: any }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updatePromotion(promotionId, data);
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

// ===== ADMIN ACTION LOGS =====

export function useListAdminActionLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<any[]>({
    queryKey: ['adminActionLogs'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listAdminActionLogs();
    },
    enabled: !!actor && !isFetching,
  });
}
