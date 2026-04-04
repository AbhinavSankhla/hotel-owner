import { Module } from '@nestjs/common';
import { AdminResolver } from './admin.resolver';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [
    TenantGuard,
    AdminResolver,
    AdminService,
  ],
  exports: [AdminService],
})
export class AdminModule {}
