import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { CashbackService } from './cashback.service';

@Controller('cashback')
@UseGuards(JwtGuard)
export class CashbackController {
    constructor(private readonly cashbackService: CashbackService) { }

    // Get current cashback balance
    @Get('balance')
    getBalance(@Request() req: any) {
        return this.cashbackService.getBalance(req.user.id);
    }

    // Get cashback transaction history
    @Get('history')
    getHistory(@Request() req: any) {
        return this.cashbackService.getHistory(req.user.id);
    }

    // Get cashback summary (balance + recent transactions)
    @Get('summary')
    getSummary(@Request() req: any) {
        return this.cashbackService.getSummary(req.user.id);
    }
}
