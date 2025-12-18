import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, ChangePasswordDto, ResetPasswordDto } from './admin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admins')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 获取所有管理员
  @Get()
  async findAll() {
    return this.adminService.findAll();
  }

  // 获取当前登录管理员信息
  @Get('me')
  async getProfile(@Request() req) {
    const admin = await this.adminService.findById(req.user.id);
    const { password, ...result } = admin;
    return result;
  }

  // 创建管理员（需要超级管理员权限）
  @Post()
  async create(@Body() dto: CreateAdminDto, @Request() req) {
    if (req.user.role !== 'super') {
      return { success: false, message: '无权限操作' };
    }
    return this.adminService.create(dto);
  }

  // 修改自己的密码
  @Post('change-password')
  async changePassword(@Body() dto: ChangePasswordDto, @Request() req) {
    return this.adminService.changePassword(req.user.id, dto.oldPassword, dto.newPassword);
  }

  // 重置其他管理员密码（需要超级管理员权限）
  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: number, @Body() dto: ResetPasswordDto, @Request() req) {
    if (req.user.role !== 'super') {
      return { success: false, message: '无权限操作' };
    }
    return this.adminService.resetPassword(id, dto.newPassword);
  }

  // 删除管理员（需要超级管理员权限）
  @Delete(':id')
  async remove(@Param('id') id: number, @Request() req) {
    if (req.user.role !== 'super') {
      return { success: false, message: '无权限操作' };
    }
    return this.adminService.remove(id);
  }
}
