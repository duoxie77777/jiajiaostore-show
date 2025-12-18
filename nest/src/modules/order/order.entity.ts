import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryColumn({ length: 20 })
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 50 })
  district: string;

  @Column({ length: 100, nullable: true })
  school: string;

  @Column({ length: 200 })
  address: string;

  @Column({ length: 20 })
  gradeCategory: string;

  @Column({ length: 20 })
  grade: string;

  @Column('simple-array')
  subjects: string[];

  @Column({ length: 50, nullable: true })
  score: string;

  @Column({ length: 50, nullable: true })
  frequency: string;

  @Column('simple-array', { nullable: true })
  availableTimes: string[];

  @Column({ length: 100, nullable: true })
  price: string;

  @Column({ length: 50, nullable: true })
  teacherType: string;

  @Column({ length: 20, nullable: true })
  contact: string;

  @Column('text', { nullable: true })
  note: string;

  @Column({ length: 10, default: 'active' })
  status: string;

  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
