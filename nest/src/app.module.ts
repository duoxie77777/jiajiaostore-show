import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from './modules/order/order.module';
import { AdminModule } from './modules/admin/admin.module';
import { ConfigModule } from './modules/config/config.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // 数据库配置
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'jiajiao',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'jiajiao',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // 生产环境请设为 false
      logging: false,
    }),
    AuthModule,
    AdminModule,
    OrderModule,
    ConfigModule,
  ],
})
export class AppModule {}
