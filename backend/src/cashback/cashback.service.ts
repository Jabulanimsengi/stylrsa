import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Commission breakdown constants
export const COMMISSION_RATES = {
    TOTAL: 0.32,        // 32% total commission
    PLATFORM: 0.25,     // 25% platform fee
    CASHBACK: 0.05,     // 5% cashback pool
    PAYMENT: 0.02,      // 2% payment processing
};

export const DEPOSIT_RATE = 0.60; // 60% deposit required

@Injectable()
export class CashbackService {
    constructor(private prisma: PrismaService) { }

    // Get user's current cashback balance
    async getBalance(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { cashbackBalance: true },
        });

        return {
            balance: user?.cashbackBalance ?? 0,
            currency: 'ZAR',
        };
    }

    // Get cashback transaction history
    async getHistory(userId: string, limit = 50) {
        return this.prisma.cashbackTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    // Get summary with balance and recent transactions
    async getSummary(userId: string) {
        const [balance, transactions] = await Promise.all([
            this.getBalance(userId),
            this.getHistory(userId, 10),
        ]);

        // Calculate totals
        const earned = await this.prisma.cashbackTransaction.aggregate({
            where: { userId, type: 'EARNED' },
            _sum: { amount: true },
        });

        const spent = await this.prisma.cashbackTransaction.aggregate({
            where: { userId, type: 'SPENT' },
            _sum: { amount: true },
        });

        return {
            balance: balance.balance,
            totalEarned: earned._sum.amount ?? 0,
            totalSpent: Math.abs(spent._sum.amount ?? 0),
            recentTransactions: transactions,
        };
    }

    // Award cashback after a completed booking/purchase
    // Called when user pays R100+, they get 5% back
    async awardCashback(userId: string, amount: number, referenceId: string, description: string) {
        const cashbackAmount = amount * COMMISSION_RATES.CASHBACK;

        if (cashbackAmount <= 0) return null;

        // Create transaction record
        const transaction = await this.prisma.cashbackTransaction.create({
            data: {
                userId,
                amount: cashbackAmount,
                type: 'EARNED',
                referenceId,
                description,
            },
        });

        // Update user balance
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                cashbackBalance: { increment: cashbackAmount },
            },
        });

        return transaction;
    }

    // Spend cashback on a booking
    async spendCashback(userId: string, amount: number, referenceId: string, description: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { cashbackBalance: true },
        });

        if (!user || user.cashbackBalance < amount) {
            throw new BadRequestException('Insufficient cashback balance');
        }

        // Create transaction record (negative amount for spending)
        const transaction = await this.prisma.cashbackTransaction.create({
            data: {
                userId,
                amount: -amount,
                type: 'SPENT',
                referenceId,
                description,
            },
        });

        // Update user balance
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                cashbackBalance: { decrement: amount },
            },
        });

        return transaction;
    }

    // Calculate booking financials with commission breakdown
    calculateBookingFinancials(servicePrice: number, useCashback = false, cashbackBalance = 0) {
        const totalCost = servicePrice;
        const depositRequired = totalCost * DEPOSIT_RATE;

        // Commission breakdown (applied to total, not deposit)
        const platformFee = totalCost * COMMISSION_RATES.PLATFORM;
        const cashbackFee = totalCost * COMMISSION_RATES.CASHBACK;
        const paymentFee = totalCost * COMMISSION_RATES.PAYMENT;
        const totalCommission = totalCost * COMMISSION_RATES.TOTAL;

        // Cashback usage
        let cashbackUsed = 0;
        let amountToPay = depositRequired;

        if (useCashback && cashbackBalance > 0) {
            // Can only use cashback if it covers the FULL booking cost
            if (cashbackBalance >= totalCost) {
                cashbackUsed = totalCost;
                amountToPay = 0;
            }
            // Partial cashback not allowed per requirements
        }

        // Salon payout (after commission)
        const salonPayout = totalCost - totalCommission;

        return {
            servicePrice,
            totalCost,
            depositRequired,
            depositPercent: DEPOSIT_RATE * 100,
            commission: {
                total: totalCommission,
                platform: platformFee,
                cashback: cashbackFee,
                payment: paymentFee,
            },
            salonPayout,
            cashback: {
                available: cashbackBalance,
                used: cashbackUsed,
                canUseFull: cashbackBalance >= totalCost,
            },
            amountToPay,
        };
    }
}
