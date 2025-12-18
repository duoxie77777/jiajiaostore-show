import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto, UpdateOrderDto, QueryOrderDto } from './order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  // 生成订单ID
  private generateOrderId(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `JJ${dateStr}${random}`;
  }

  // 创建订单
  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepo.create({
      ...dto,
      id: this.generateOrderId(),
      date: new Date().toISOString().split('T')[0],
      status: 'active',
    });
    return this.orderRepo.save(order);
  }

  // 查询订单列表
  async findAll(query: QueryOrderDto) {
    const { keyword, district, gradeCategory, grade, subject, status, dateFrom, dateTo, page = 1, pageSize = 10 } = query;
    
    const qb = this.orderRepo.createQueryBuilder('order');
    
    // 关键词搜索
    if (keyword) {
      qb.andWhere(
        '(order.title LIKE :keyword OR order.district LIKE :keyword OR order.grade LIKE :keyword OR order.address LIKE :keyword OR order.school LIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }
    
    // 地区筛选
    if (district) {
      qb.andWhere('order.district = :district', { district });
    }
    
    // 学段筛选
    if (gradeCategory) {
      qb.andWhere('order.gradeCategory = :gradeCategory', { gradeCategory });
    }
    
    // 年级筛选
    if (grade) {
      qb.andWhere('order.grade = :grade', { grade });
    }
    
    // 科目筛选
    if (subject) {
      qb.andWhere('order.subjects LIKE :subject', { subject: `%${subject}%` });
    }
    
    // 状态筛选
    if (status) {
      qb.andWhere('order.status = :status', { status });
    }
    
    // 日期筛选
    if (dateFrom) {
      qb.andWhere('order.date >= :dateFrom', { dateFrom });
    }
    if (dateTo) {
      qb.andWhere('order.date <= :dateTo', { dateTo });
    }
    
    // 排序
    qb.orderBy('order.createTime', 'DESC');
    
    // 分页
    const total = await qb.getCount();
    const list = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    
    return {
      list,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 获取前台展示的订单（只显示上架的）
  async findActive(query: QueryOrderDto) {
    return this.findAll({ ...query, status: 'active' });
  }

  // 获取单个订单
  async findOne(id: string): Promise<Order> {
    return this.orderRepo.findOne({ where: { id } });
  }

  // 更新订单
  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    await this.orderRepo.update(id, dto);
    return this.findOne(id);
  }

  // 切换订单状态
  async toggleStatus(id: string): Promise<Order> {
    const order = await this.findOne(id);
    if (order) {
      order.status = order.status === 'active' ? 'inactive' : 'active';
      return this.orderRepo.save(order);
    }
    return null;
  }

  // 删除订单
  async remove(id: string): Promise<boolean> {
    const result = await this.orderRepo.delete(id);
    return result.affected > 0;
  }
}
