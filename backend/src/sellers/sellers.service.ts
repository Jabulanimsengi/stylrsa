import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

// Product commission rate (10%)
const PRODUCT_COMMISSION_RATE = 0.10;

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string) {
    const seller = await this.prisma.user.findFirst({
      where: { id, role: 'PRODUCT_SELLER' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        products: {
          where: { approvalStatus: 'APPROVED' },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            images: true,
            stock: true,
            sellerId: true,
            isOnSale: true,
            salePrice: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return seller;
  }

  async getStats(sellerId: string, period: 'week' | 'month' | 'year' = 'month') {
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'month':
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    // Fetch all orders for this seller within the period
    const orders = await this.prisma.productOrder.findMany({
      where: {
        sellerId,
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        totalPrice: true,
        status: true,
        createdAt: true,
      },
    });

    // Calculate statistics
    const completedOrders = orders.filter(o => o.status === 'DELIVERED');
    const pendingOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status));

    const totalSales = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrders = orders.length;
    const totalCommission = totalSales * PRODUCT_COMMISSION_RATE;
    const netEarnings = totalSales - totalCommission;

    // Calculate monthly sales for chart (last 6 months)
    const monthlySales = await this.calculateMonthlySales(sellerId);

    return {
      totalSales,
      totalOrders,
      totalCommission,
      netEarnings,
      pendingOrders: pendingOrders.length,
      completedOrders: completedOrders.length,
      monthlySales,
      period,
      commissionRate: PRODUCT_COMMISSION_RATE,
    };
  }

  private async calculateMonthlySales(sellerId: string) {
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const orders = await this.prisma.productOrder.findMany({
      where: {
        sellerId,
        status: 'DELIVERED',
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
    });

    // Group by month
    const monthlyData: Record<string, number> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      const key = monthNames[d.getMonth()];
      monthlyData[key] = 0;
    }

    // Sum orders by month
    for (const order of orders) {
      const monthKey = monthNames[order.createdAt.getMonth()];
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey] += order.totalPrice;
      }
    }

    // Convert to array format
    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount,
    }));
  }
}
