import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class AuthService {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService,
  ) {}

  // 验证用户
  async validateUser(username: string, password: string): Promise<any> {
    const admin = await this.adminService.findByUsername(username);
    if (admin && await this.adminService.validatePassword(password, admin.password)) {
      const { password, ...result } = admin;
      return result;
    }
    return null;
  }

  // 登录
  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      return { success: false, message: '用户名或密码错误' };
    }
    
    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      success: true,
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }
}
