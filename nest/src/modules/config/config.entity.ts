import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('configs')
export class Config {
  @PrimaryColumn({ length: 50 })
  key: string;

  @Column('text')
  value: string;

  @UpdateDateColumn()
  updateTime: Date;
}
