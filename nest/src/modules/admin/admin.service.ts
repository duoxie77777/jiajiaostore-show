import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Admin } from './admin.entity';
import { CreateAdminDto } from './admin.dto';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
  ) {}

  // 初始化默认管理员
  async onModuleInit() {
    const count = await this.adminRepo.count();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await this.adminRepo.save({
        username: 'admin',
        password: hashedPassword,
        role: 'super',
      });
      console.log('✅ 已创建默认管理员: admin / 123456');
    }
  }

  // 根据用户名查找
  async findByUsername(username: string): Promise<Admin> {
    return this.adminRepo.findOne({ where: { username } });
  }

  // 根据ID查找
  async findById(id: number): Promise<Admin> {
    return this.adminRepo.findOne({ where: { id } });
  }

  // 验证密码
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // 获取所有管理员（不返回密码）
  async findAll(): Promise<Partial<Admin>[]> {
    const admins = await this.adminRepo.find();
    return admins.map(({ password, ...rest }) => rest);
  }

  // 创建管理员
  async create(dto: CreateAdminDto): Promise<{ success: boolean; message?: string }> {
    const exists = await this.findByUsername(dto.username);
    if (exists) {
      return { success: false, message: '用户名已存在' };
    }
    
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.adminRepo.save({
      username: dto.username,
      password: hashedPassword,
      role: 'normal',
    });
    return { success: true };
  }

  // 修改密码
  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    const admin = await this.findById(id);
    if (!admin) {
      return { success: false, message: '管理员不存在' };
    }
    
    const isValid = await this.validatePassword(oldPassword, admin.password);
    if (!isValid) {
      return { success: false, message: '原密码错误' };
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.adminRepo.update(id, { password: hashedPassword });
    return { success: true };
  }

  // 重置密码（超级管理员）
  async resetPassword(id: number, newPassword: string): Promise<{ success: boolean; message?: string }> {
    const admin = await this.findById(id);
    if (!admin) {
      return { success: false, message: '管理员不存在' };
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.adminRepo.update(id, { password: hashedPassword });
    return { success: true };
  }

  // 删除管理员
  async remove(id: number): Promise<{ success: boolean; message?: string }> {
    const admin = await this.findById(id);
    if (!admin) {
      return { success: false, message: '管理员不存在' };
    }
    if (admin.role === 'super') {
      return { success: false, message: '不能删除超级管理员' };
    }
    
    await this.adminRepo.delete(id);
    return { success: true };
  }
}
