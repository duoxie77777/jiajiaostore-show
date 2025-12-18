import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ConfigService } from './config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('configs')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  // 获取所有配置（公开）
  @Get()
  async getAll() {
    return this.configService.getAll();
  }

  // 获取单个配置（公开）
  @Get(':key')
  async get(@Param('key') key: string) {
    return this.configService.get(key);
  }

  // 设置配置（需要认证）
  @Post(':key')
  @UseGuards(JwtAuthGuard)
  async set(@Param('key') key: string, @Body() body: { value: any }) {
    const success = await this.configService.set(key, body.value);
    return { success };
  }

  // 删除配置（需要认证）
  @Delete(':key')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('key') key: string) {
    const success = await this.configService.remove(key);
    return { success };
  }
}
