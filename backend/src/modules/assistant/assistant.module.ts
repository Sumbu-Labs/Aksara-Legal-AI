import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AssistantService } from './application/services/assistant.service';
import { AssistantController } from './presentation/controllers/assistant.controller';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [AssistantController],
  providers: [AssistantService],
  exports: [AssistantService],
})
export class AssistantModule {}
