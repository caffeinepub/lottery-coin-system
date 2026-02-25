import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // ===== MIXINS =====

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ===== TYPES =====

  public type LotteryType = {
    #daily;
    #weekly;
  };

  public type LotteryStatus = {
    #active;
    #completed;
    #cancelled;
  };

  public type BalanceRequestStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type WithdrawalStatus = {
    #pending;
    #completed;
    #rejected;
  };

  public type TransactionType = {
    #add_balance;
    #buy_ticket;
    #win;
    #withdraw;
    #adminBonus;
    #firstUserDiscount;
    #referralBonus;
    #limitedDiscount;
    #cashback;
    #loyaltyReward;
    #festivalCampaign;
  };

  public type DrawInterval = {
    #daily;
    #weekly;
    #h1;
    #h3;
    #h5;
    #h12;
  };

  public type UserProfile = {
    id : Text;
    name : Text;
    email : Text;
    coinsBalance : Nat;
    createdAt : Time.Time;
    role : Text;
    isVerified : Bool;
    isBlocked : Bool;
    blockedAt : ?Time.Time;
    referralCode : Text;
  };

  public type UserRecord = {
    principal : Principal;
    name : Text;
    email : Text;
    passwordHash : Text;
    isVerified : Bool;
    otp : ?Text;
    otpExpiry : ?Time.Time;
    coinsBalance : Nat;
    createdAt : Time.Time;
    isBlocked : Bool;
    blockedAt : ?Time.Time;
    referralCode : Text;
    totalTicketsPurchased : Nat;
    hasUsedReferral : Bool;
  };

  public type LotteryPool = {
    id : Text;
    name : Text;
    lotteryType : LotteryType;
    drawInterval : DrawInterval;
    ticketPrice : Nat;
    maxTickets : Nat;
    ticketsPerUserMax : Nat;
    drawTime : Time.Time;
    status : LotteryStatus;
    totalTicketsSold : Nat;
    totalPoolAmount : Nat;
    description : Text;
    logo : ?Storage.ExternalBlob;
    firstPrizeRatio : Nat;
    secondPrizeRatio : Nat;
    thirdPrizeRatio : Nat;
    createdAt : Time.Time;
  };

  public type Ticket = {
    id : Text;
    userId : Principal;
    lotteryPoolId : Text;
    ticketNumber : Nat;
    purchaseTime : Time.Time;
    isWinner : Bool;
    prizeAmount : Nat;
  };

  public type WalletTransaction = {
    id : Text;
    userId : Principal;
    transactionType : TransactionType;
    amount : Nat;
    lotteryPoolId : ?Text;
    ticketId : ?Text;
    description : Text;
    createdAt : Time.Time;
  };

  public type BalanceRequest = {
    id : Text;
    userId : Principal;
    amount : Nat;
    paymentScreenshotUrl : Text;
    status : BalanceRequestStatus;
    adminNotes : ?Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type Withdrawal = {
    id : Text;
    userId : Principal;
    amount : Nat;
    upiId : ?Text;
    bankDetails : ?Text;
    status : WithdrawalStatus;
    adminNotes : ?Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type Draw = {
    id : Text;
    lotteryPoolId : Text;
    winningNumber : Nat;
    drawTime : Time.Time;
    totalTickets : Nat;
    totalPrizeDistributed : Nat;
    createdAt : Time.Time;
  };

  public type WinnerRecord = {
    username : Text;
    rank : Nat;
    ticketNumber : Nat;
    prizeAmount : Nat;
  };

  public type DrawResult = {
    winningNumber : Nat;
    totalTickets : Nat;
    totalPrizeDistributed : Nat;
    drawTime : Time.Time;
    winners : [WinnerRecord];
  };

  public type LotteryLiveStats = {
    ticketsSold : Nat;
    remainingTickets : Nat;
    totalPoolAmount : Nat;
    drawTime : Time.Time;
    currentStatus : LotteryStatus;
  };

  public type RegistrationData = {
    name : Text;
    email : Text;
    passwordHash : Text;
    referralCode : ?Text;
  };

  public type CreateLotteryData = {
    name : Text;
    lotteryType : LotteryType;
    drawInterval : DrawInterval;
    ticketPrice : Nat;
    maxTickets : Nat;
    ticketsPerUserMax : Nat;
    drawTime : Time.Time;
    description : Text;
    logo : ?Storage.ExternalBlob;
    firstPrizeRatio : Nat;
    secondPrizeRatio : Nat;
    thirdPrizeRatio : Nat;
  };

  public type UpdateLotteryData = {
    name : ?Text;
    ticketPrice : ?Nat;
    description : ?Text;
    logo : ?Storage.ExternalBlob;
    status : ?LotteryStatus;
  };

  public type DashboardStats = {
    totalRevenue : Nat;
    totalActiveUsers : Nat;
    activeLotteryPoolsCount : Nat;
    pendingApprovalsCount : Nat;
  };

  public type PromotionType = {
    #adminBonus;
    #firstUserDiscount;
    #referralBonus;
    #limitedDiscount;
    #cashback;
    #loyaltyReward;
    #festivalCampaign;
  };

  public type Promotion = {
    id : Text;
    promoType : PromotionType;
    description : Text;
    discountPercent : ?Nat;
    bonusAmount : ?Nat;
    startTime : Time.Time;
    endTime : ?Time.Time;
    isActive : Bool;
    createdBy : Principal;
  };

  public type UserPromoUsage = {
    userId : Principal;
    promotionId : Text;
    usedAt : Time.Time;
    createdAt : Time.Time;
  };

  public type AdminActionType = {
    #block;
    #unblock;
    #roleChange;
  };

  public type AdminActionLog = {
    id : Text;
    adminPrincipal : Principal;
    targetUserId : Principal;
    action : AdminActionType;
    reason : ?Text;
    timestamp : Time.Time;
  };

  // ===== AUTH =====

  // Rely on system principal
  // func getCallerPrincipal({ caller }) {
  //   caller;
  // };

  // ===== STABLE STATE =====

  var nextLotteryPoolId : Nat = 0;
  var nextTicketId : Nat = 0;
  var nextTransactionId : Nat = 0;
  var nextBalanceRequestId : Nat = 0;
  var nextWithdrawalId : Nat = 0;
  var nextDrawId : Nat = 0;
  var nextPromotionId : Nat = 0;
  var nextAdminActionId : Nat = 0;

  var users = Map.empty<Principal, UserRecord>();
  var lotteryPools = Map.empty<Text, LotteryPool>();
  var tickets = Map.empty<Text, Ticket>();
  var walletTransactions = Map.empty<Text, WalletTransaction>();
  var balanceRequests = Map.empty<Text, BalanceRequest>();
  var withdrawals = Map.empty<Text, Withdrawal>();
  var draws = Map.empty<Text, Draw>();
  var promotions = Map.empty<Text, Promotion>();
  var userPromoUsages = Map.empty<Text, UserPromoUsage>();
  var adminActionLogs = Map.empty<Text, AdminActionLog>();

  // Loyalty thresholds: every 10 tickets earns a loyalty reward
  let loyaltyThreshold : Nat = 10;
  let loyaltyBonusAmount : Nat = 50;

  // Referral bonus amounts
  let referralBonusReferrer : Nat = 100;
  let referralBonusReferee : Nat = 50;

  // ===== HELPER FUNCTIONS =====

  func genId(prefix : Text, counter : Nat) : Text {
    prefix # counter.toText();
  };

  func natToText(n : Nat) : Text {
    n.toText();
  };

  func genLotteryPoolId() : Text {
    let id = genId("pool-", nextLotteryPoolId);
    nextLotteryPoolId += 1;
    id;
  };

  func genTicketId() : Text {
    let id = genId("ticket-", nextTicketId);
    nextTicketId += 1;
    id;
  };

  func genTransactionId() : Text {
    let id = genId("tx-", nextTransactionId);
    nextTransactionId += 1;
    id;
  };

  func genBalanceRequestId() : Text {
    let id = genId("br-", nextBalanceRequestId);
    nextBalanceRequestId += 1;
    id;
  };

  func genWithdrawalId() : Text {
    let id = genId("wd-", nextWithdrawalId);
    nextWithdrawalId += 1;
    id;
  };

  func genDrawId() : Text {
    let id = genId("draw-", nextDrawId);
    nextDrawId += 1;
    id;
  };

  func genPromotionId() : Text {
    let id = genId("promo-", nextPromotionId);
    nextPromotionId += 1;
    id;
  };

  func genAdminActionId() : Text {
    let id = genId("action-", nextAdminActionId);
    nextAdminActionId += 1;
    id;
  };

  func genPromoUsageId(userId : Principal, promoId : Text) : Text {
    userId.toText() # "-" # promoId;
  };

  // requireUser checks blocked status and returns the user record
  func requireUser(caller : Principal) : UserRecord {
    switch (users.get(caller)) {
      case (?u) {
        if (u.isBlocked) {
          Runtime.trap("Account is blocked");
        };
        u;
      };
      case null { Runtime.trap("User record not found") };
    };
  };

  // requireUserRecord returns user record without blocked check (for internal use)
  func getUserRecord(userId : Principal) : ?UserRecord {
    users.get(userId);
  };

  func generateReferralCode(name : Text, timestamp : Time.Time) : Text {
    let suffix = natToText(Int.abs(timestamp) % 100_000_000);
    name # "-" # suffix;
  };

  // Validate ticket number digit length based on draw interval
  func validateTicketNumber(ticketNumber : Nat, drawInterval : DrawInterval) : Bool {
    let numStr = natToText(ticketNumber);
    let len = numStr.size();
    switch (drawInterval) {
      case (#h1) { len == 6 };
      case (#h3) { len == 6 };
      case (#h5) { len == 6 };
      case (#h12) { len == 6 };
      case (#daily) { len == 9 };
      case (#weekly) { len == 12 };
    };
  };

  // Credit coins to a user wallet (skips blocked users)
  func creditUserWallet(userId : Principal, amount : Nat, txType : TransactionType, poolId : ?Text, ticketId : ?Text, description : Text) {
    switch (users.get(userId)) {
      case (?u) {
        if (u.isBlocked) { return }; // skip blocked users
        let updatedUser : UserRecord = {
          principal = u.principal;
          name = u.name;
          email = u.email;
          passwordHash = u.passwordHash;
          isVerified = u.isVerified;
          otp = u.otp;
          otpExpiry = u.otpExpiry;
          coinsBalance = u.coinsBalance + amount;
          createdAt = u.createdAt;
          isBlocked = u.isBlocked;
          blockedAt = u.blockedAt;
          referralCode = u.referralCode;
          totalTicketsPurchased = u.totalTicketsPurchased;
          hasUsedReferral = u.hasUsedReferral;
        };
        users.remove(userId);
        users.add(userId, updatedUser);
        let txId = genTransactionId();
        let tx : WalletTransaction = {
          id = txId;
          userId;
          transactionType = txType;
          amount;
          lotteryPoolId = poolId;
          ticketId;
          description;
          createdAt = Time.now();
        };
        walletTransactions.add(txId, tx);
      };
      case null {};
    };
  };

  // Check if a promotion is currently active
  func isPromotionActive(promo : Promotion) : Bool {
    if (not promo.isActive) { return false };
    let now = Time.now();
    if (now < promo.startTime) { return false };
    switch (promo.endTime) {
      case (?endTime) { now <= endTime };
      case null { true };
    };
  };

  // Find active promotion of a given type
  func findActivePromotion(promoType : PromotionType) : ?Promotion {
    for (promo in promotions.values()) {
      if (isPromotionActive(promo)) {
        switch (promo.promoType, promoType) {
          case (#limitedDiscount, #limitedDiscount) { return ?promo };
          case (#cashback, #cashback) { return ?promo };
          case (#festivalCampaign, #festivalCampaign) { return ?promo };
          case (#loyaltyReward, #loyaltyReward) { return ?promo };
          case (#referralBonus, #referralBonus) { return ?promo };
          case (#firstUserDiscount, #firstUserDiscount) { return ?promo };
          case (#adminBonus, #adminBonus) { return ?promo };
          case _ {};
        };
      };
    };
    null;
  };

  // Find user by referral code
  func findUserByReferralCode(code : Text) : ?Principal {
    for ((p, u) in users.entries()) {
      if (u.referralCode == code) {
        return ?p;
      };
    };
    null;
  };

  // ===== USER PROFILE (required by instructions) =====

  // getCallerUserProfile: accessible by any authenticated (non-anonymous) caller.
  // Returns #err(#notFound) if no profile exists yet, so the frontend can show
  // the profile setup flow instead of an error message.
  // Anonymous principals (guests) are rejected since they cannot have a profile.
  public query ({ caller }) func getCallerUserProfile() : async {
    #ok : UserProfile;
    #err : { #notFound; #unauthorized };
  } {
    // Reject anonymous callers — they cannot own a profile
    if (caller.isAnonymous()) {
      return #err(#unauthorized);
    };
    // Look up the caller's profile by their Internet Identity principal
    switch (users.get(caller)) {
      case (?user) {
        let role = if (AccessControl.isAdmin(accessControlState, caller)) {
          "admin";
        } else {
          "user";
        };
        #ok({
          id = caller.toText();
          name = user.name;
          email = user.email;
          coinsBalance = user.coinsBalance;
          createdAt = user.createdAt;
          role;
          isVerified = user.isVerified;
          isBlocked = user.isBlocked;
          blockedAt = user.blockedAt;
          referralCode = user.referralCode;
        });
      };
      // No profile found — return a clearly distinguishable #notFound variant
      // so the frontend can show the profile setup flow
      case null { #err(#notFound) };
    };
  };

  // saveCallerUserProfile: only authenticated, non-blocked users with the #user role
  // may update their own profile.
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    // Enforce #user role via AccessControl
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    // Also enforce the user record exists and the account is not blocked
    let _ = requireUser(caller);
    switch (users.get(caller)) {
      case (?u) {
        let updated : UserRecord = {
          principal = u.principal;
          name = profile.name;
          email = profile.email;
          passwordHash = u.passwordHash;
          isVerified = u.isVerified;
          otp = u.otp;
          otpExpiry = u.otpExpiry;
          coinsBalance = u.coinsBalance;
          createdAt = u.createdAt;
          isBlocked = u.isBlocked;
          blockedAt = u.blockedAt;
          referralCode = u.referralCode;
          totalTicketsPurchased = u.totalTicketsPurchased;
          hasUsedReferral = u.hasUsedReferral;
        };
        users.remove(caller);
        users.add(caller, updated);
      };
      case null { Runtime.trap("User record not found") };
    };
  };

  // getUserProfile: a user may view their own profile; admins may view any profile.
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (users.get(user)) {
      case (?u) {
        let role = if (AccessControl.isAdmin(accessControlState, user)) { "admin" } else {
          "user";
        };
        ?{
          id = user.toText();
          name = u.name;
          email = u.email;
          coinsBalance = u.coinsBalance;
          createdAt = u.createdAt;
          role;
          isVerified = u.isVerified;
          isBlocked = u.isBlocked;
          blockedAt = u.blockedAt;
          referralCode = u.referralCode;
        };
      };
      case null { null };
    };
  };
};
