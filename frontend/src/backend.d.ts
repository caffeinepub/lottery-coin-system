import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface CreateLotteryData {
    lotteryType: LotteryType;
    ticketsPerUserMax: bigint;
    logo?: ExternalBlob;
    name: string;
    firstPrizeRatio: bigint;
    description: string;
    drawTime: Time;
    firstPrizePercent: bigint;
    thirdPrizePercent: bigint;
    maxTickets: bigint;
    secondPrizeRatio: bigint;
    secondPrizePercent: bigint;
    winnerPayoutPercent: bigint;
    ticketPrice: bigint;
    thirdPrizeRatio: bigint;
    drawInterval: DrawInterval;
}
export interface LotteryPool {
    id: string;
    status: LotteryStatus;
    totalTicketsSold: bigint;
    lotteryType: LotteryType;
    ticketsPerUserMax: bigint;
    logo?: ExternalBlob;
    name: string;
    createdAt: Time;
    firstPrizeRatio: bigint;
    description: string;
    drawTime: Time;
    firstPrizePercent: bigint;
    thirdPrizePercent: bigint;
    maxTickets: bigint;
    secondPrizeRatio: bigint;
    secondPrizePercent: bigint;
    totalPoolAmount: bigint;
    winnerPayoutPercent: bigint;
    ticketPrice: bigint;
    thirdPrizeRatio: bigint;
    drawInterval: DrawInterval;
}
export interface UserProfile {
    id: string;
    referralCode: string;
    isBlocked: boolean;
    name: string;
    createdAt: Time;
    role: string;
    blockedAt?: Time;
    email: string;
    coinsBalance: bigint;
    isVerified: boolean;
}
export enum CreateLotteryError {
    invalidTicketConfig = "invalidTicketConfig",
    invalidPrizeConfig = "invalidPrizeConfig",
    invalidDrawTime = "invalidDrawTime",
    unauthorized = "unauthorized"
}
export enum DrawInterval {
    h1 = "h1",
    h3 = "h3",
    h5 = "h5",
    h12 = "h12",
    daily = "daily",
    weekly = "weekly"
}
export enum LotteryStatus {
    active = "active",
    cancelled = "cancelled",
    completed = "completed"
}
export enum LotteryType {
    daily = "daily",
    weekly = "weekly"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_notFound_unauthorized {
    notFound = "notFound",
    unauthorized = "unauthorized"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createLottery(data: CreateLotteryData): Promise<{
        __kind__: "ok";
        ok: LotteryPool;
    } | {
        __kind__: "err";
        err: CreateLotteryError;
    }>;
    getCallerUserProfile(): Promise<{
        __kind__: "ok";
        ok: UserProfile;
    } | {
        __kind__: "err";
        err: Variant_notFound_unauthorized;
    }>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
