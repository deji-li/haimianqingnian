import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WeWorkConfig } from './entities/wework-config.entity'
import { WeWorkBasicController } from './wework-basic.controller'
import { WeWorkBasicService } from './wework-basic.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([WeWorkConfig]),
  ],
  controllers: [WeWorkBasicController],
  providers: [WeWorkBasicService],
  exports: [WeWorkBasicService, TypeOrmModule.forFeature([WeWorkConfig])],
})
export class WeWorkBasicModule {}