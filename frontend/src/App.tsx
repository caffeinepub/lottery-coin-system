import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProfileSetupModal from '@/components/ProfileSetupModal';

// Pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import UserDashboard from '@/pages/UserDashboard';
import LotteryList from '@/pages/LotteryList';
import BuyTicket from '@/pages/BuyTicket';
import MyTickets from '@/pages/MyTickets';
import AddBalance from '@/pages/AddBalance';
import WithdrawalRequest from '@/pages/WithdrawalRequest';
import TransactionHistory from '@/pages/TransactionHistory';
import DrawResults from '@/pages/DrawResults';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import BalanceRequests from '@/pages/admin/BalanceRequests';
import WithdrawalManagement from '@/pages/admin/WithdrawalManagement';
import LotteryManagement from '@/pages/admin/LotteryManagement';
import UserManagement from '@/pages/admin/UserManagement';
import Promotions from '@/pages/admin/Promotions';
import DrawDeclaration from '@/pages/admin/DrawDeclaration';

// Error Boundary
class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Layout wrapper with Navbar
function RootLayout() {
  const { isAuthenticated, isLoading, userProfile, isFetched, showProfileSetup, completeProfileSetup } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      {showProfileSetup && (
        <ProfileSetupModal onComplete={completeProfileSetup} />
      )}
    </div>
  );
}

// Auth guard for protected routes
function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) {
    window.location.href = '/login';
    return <LoadingSpinner />;
  }
  return <>{children}</>;
}

// Admin guard
function AdminGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, userProfile } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) {
    window.location.href = '/login';
    return <LoadingSpinner />;
  }
  if (userProfile?.role !== 'admin') {
    window.location.href = '/dashboard';
    return <LoadingSpinner />;
  }
  return <>{children}</>;
}

// Admin layout with sidebar
function AdminLayout() {
  return (
    <AdminGuard>
      <div className="flex min-h-[calc(100vh-64px)]">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </AdminGuard>
  );
}

function AdminSidebar() {
  const links = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/lotteries', label: 'Lottery Management', icon: '🎰' },
    { href: '/admin/balance-requests', label: 'Balance Requests', icon: '💰' },
    { href: '/admin/withdrawals', label: 'Withdrawals', icon: '💸' },
    { href: '/admin/users', label: 'User Management', icon: '👥' },
    { href: '/admin/promotions', label: 'Promotions', icon: '🎁' },
    { href: '/admin/draws', label: 'Draw Declaration', icon: '🎲' },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold text-primary">Admin Panel</h2>
      </div>
      <nav className="p-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors mb-1 text-sm"
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// Create routes
const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Landing,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <AuthGuard>
      <UserDashboard />
    </AuthGuard>
  ),
});

const lotteriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lotteries',
  component: LotteryList,
});

const buyTicketRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lotteries/$id/buy',
  component: () => (
    <AuthGuard>
      <BuyTicket />
    </AuthGuard>
  ),
});

const myTicketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-tickets',
  component: () => (
    <AuthGuard>
      <MyTickets />
    </AuthGuard>
  ),
});

const addBalanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-balance',
  component: () => (
    <AuthGuard>
      <AddBalance />
    </AuthGuard>
  ),
});

const withdrawRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/withdraw',
  component: () => (
    <AuthGuard>
      <WithdrawalRequest />
    </AuthGuard>
  ),
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  component: () => (
    <AuthGuard>
      <TransactionHistory />
    </AuthGuard>
  ),
});

const drawResultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/results/$lotteryId',
  component: DrawResults,
});

// Admin routes
const adminRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayout,
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: '/',
  component: AdminDashboard,
});

const adminBalanceRequestsRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: '/balance-requests',
  component: BalanceRequests,
});

const adminWithdrawalsRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: '/withdrawals',
  component: WithdrawalManagement,
});

const adminLotteriesRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: '/lotteries',
  component: LotteryManagement,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: '/users',
  component: UserManagement,
});

const adminPromotionsRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: '/promotions',
  component: Promotions,
});

const adminDrawsRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: '/draws',
  component: DrawDeclaration,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  dashboardRoute,
  lotteriesRoute,
  buyTicketRoute,
  myTicketsRoute,
  addBalanceRoute,
  withdrawRoute,
  transactionsRoute,
  drawResultsRoute,
  adminRootRoute.addChildren([
    adminIndexRoute,
    adminBalanceRequestsRoute,
    adminWithdrawalsRoute,
    adminLotteriesRoute,
    adminUsersRoute,
    adminPromotionsRoute,
    adminDrawsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
