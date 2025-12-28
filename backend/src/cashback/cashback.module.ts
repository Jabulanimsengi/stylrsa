import { Module } from '@nestjs/common';
import { CashbackController } from './cashback.controller';
import { CashbackService } from './cashback.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CashbackController],
    providers: [CashbackService],
    exports: [CashbackService],
})
export class CashbackModule { }
