import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { SupabaseModule } from './common/supabase/supabase.module';
import { AuthGuard } from './common/guards/auth.guard';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { SettingsModule } from './settings/settings.module';
import { BlogsModule } from './blogs/blogs.module';
import { PropertiesModule } from './properties/properties.module';
import { CurationsModule } from './curations/curations.module';
import { AdvisorsModule } from './advisors/advisors.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'change-me',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as any,
      },
    }),
    SupabaseModule,
    AuthModule,
    SettingsModule,
    BlogsModule,
    PropertiesModule,
    CurationsModule,
    AdvisorsModule,
    EnquiriesModule,
    NewsletterModule,
    UploadsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}