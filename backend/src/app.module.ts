import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessProfileModule } from './modules/business-profile/business-profile.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, BusinessProfileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
