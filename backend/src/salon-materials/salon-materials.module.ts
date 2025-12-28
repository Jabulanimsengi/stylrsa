import { Module } from '@nestjs/common';
import { SalonMaterialsController } from './salon-materials.controller';
import { SalonMaterialsService } from './salon-materials.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [SalonMaterialsController],
    providers: [SalonMaterialsService],
    exports: [SalonMaterialsService],
})
export class SalonMaterialsModule { }
