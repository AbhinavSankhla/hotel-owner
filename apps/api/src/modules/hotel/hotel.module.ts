import { Module } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelResolver } from './hotel.resolver';
import { DomainResolveController } from './domain-resolve.controller';

@Module({
  controllers: [DomainResolveController],
  providers: [HotelService, HotelResolver],
  exports: [HotelService],
})
export class HotelModule {}
