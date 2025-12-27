import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './config.entity';

// 默认配置
const DEFAULT_CONFIGS = {
  districts: [
    { value: '思明区', label: '思明区' },
    { value: '湖里区', label: '湖里区' },
    { value: '集美区', label: '集美区' },
    { value: '海沧区', label: '海沧区' },
    { value: '同安区', label: '同安区' },
    { value: '翔安区', label: '翔安区' }
  ],
  gradeCategories: [
    { 
      value: 'elementary', 
      label: '小学',
      grades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
      subjects: ['语文', '数学', '英语', '科学', '道德与法治', '美术', '音乐']
    },
    { 
      value: 'junior', 
      label: '初中',
      grades: ['初一', '初二', '初三'],
      subjects: ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治']
    },
    { 
      value: 'senior', 
      label: '高中',
      grades: ['高一', '高二', '高三'],
      subjects: ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治']
    }
  ],
  teacherTypes: ['大学生', '机构老师', '专职老师', '在职老师', '不限']
};

@Injectable()
export class ConfigService implements OnModuleInit {
  constructor(
    @InjectRepository(Config)
    private configRepo: Repository<Config>,
  ) {}

  // 初始化默认配置
  async onModuleInit() {
    for (const [key, value] of Object.entries(DEFAULT_CONFIGS)) {
      const exists = await this.configRepo.findOne({ where: { key } });
      if (!exists) {
        await this.configRepo.save({
          key,
          value: JSON.stringify(value),
        });
      }
    }
    console.log('✅ 配置已初始化');
  }

  // 获取单个配置
  async get(key: string): Promise<any> {
    const config = await this.configRepo.findOne({ where: { key } });
    if (config) {
      try {
        return JSON.parse(config.value);
      } catch {
        return config.value;
      }
    }
    return null;
  }

  // 获取所有配置
  async getAll(): Promise<Record<string, any>> {
    const configs = await this.configRepo.find();
    const result: Record<string, any> = {};
    for (const config of configs) {
      try {
        result[config.key] = JSON.parse(config.value);
      } catch {
        result[config.key] = config.value;
      }
    }
    return result;
  }

  // 设置配置
  async set(key: string, value: any): Promise<boolean> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const exists = await this.configRepo.findOne({ where: { key } });
    
    if (exists) {
      await this.configRepo.update(key, { value: stringValue });
    } else {
      await this.configRepo.save({ key, value: stringValue });
    }
    return true;
  }

  // 删除配置
  async remove(key: string): Promise<boolean> {
    const result = await this.configRepo.delete(key);
    return result.affected > 0;
  }
}
