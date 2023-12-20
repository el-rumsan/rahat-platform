import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaDbModule } from '@binod7/prisma-db';
import { RumsanUserModule } from '@binod7/rumsan-user';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BeneficiaryModule } from './beneficiary/beneficiary.module';
import { ListenerModule } from './common/listeners/listener.module';
import { ProjectModule } from './project/project.module';
import { ReportsModule } from './reports/reports.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    PrismaDbModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: +configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
          retryStrategy: (times) => {
            // reconnect after
            return Math.min(times * 50, 2000);
          },
          // might need to change on producttion
          maxRetriesPerRequest: 1000,
        },
      }),
      inject: [ConfigService],
    }),
    ListenerModule,
    RumsanUserModule,
    //UsersModule,
    //AuthModule,
    ProjectModule,
    BeneficiaryModule,
    ReportsModule,
    TransactionsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env`],
      // load: [
      //   async () => {
      //     return {
      //       BAAL: 4400,
      //     };
      //   },
      // ],
    }),
    //VendorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
