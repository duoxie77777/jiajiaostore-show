import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto, QueryOrderDto } from './order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 前台获取订单列表（只显示上架的）
  @Get()
  async findActive(@Query() query: QueryOrderDto) {
    return this.orderService.findActive(query);
  }

  // 后台获取所有订单（需要认证）
  @Get('admin')
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: QueryOrderDto) {
    return this.orderService.findAll(query);
  }

  // 获取单个订单
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  // 创建订单（需要认证）
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  // 更新订单（需要认证）
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.update(id, dto);
  }

  // 切换订单状态（需要认证）
  @Put(':id/toggle')
  @UseGuards(JwtAuthGuard)
  async toggleStatus(@Param('id') id: string) {
    return this.orderService.toggleStatus(id);
  }

  // 删除订单（需要认证）
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    const success = await this.orderService.remove(id);
    return { success };
  }
}
