import { PrismaDbModule } from '@binod7/prisma-db';
import { Module } from '@nestjs/common';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

@Module({
  controllers: [VendorsController],
  providers: [VendorsService],
  imports: [PrismaDbModule],
})
export class VendorsModule {}
