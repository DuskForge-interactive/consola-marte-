import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TestPingModule } from './test-ping/test-ping.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl:
          config.get('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        autoLoadEntities: true,
        synchronize: false, // NO toques la estructura desde TypeORM, ya que Supabase la maneja con SQL
      }),
    }),
    ScheduleModule.forRoot(),
    TestPingModule,
    ResourcesModule,
    // aquí luego metes tus módulos, por ejemplo ResourcesModule
  ],
})
export class AppModule {}
