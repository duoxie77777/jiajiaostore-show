import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsOptional()
  school?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  gradeCategory: string;

  @IsString()
  @IsNotEmpty()
  grade: string;

  @IsArray()
  @IsNotEmpty()
  subjects: string[];

  @IsString()
  @IsOptional()
  score?: string;

  @IsString()
  @IsOptional()
  frequency?: string;

  @IsArray()
  @IsOptional()
  availableTimes?: string[];

  @IsString()
  @IsOptional()
  availableTimesText?: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsString()
  @IsOptional()
  teacherType?: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateOrderDto extends CreateOrderDto {
  @IsString()
  @IsOptional()
  status?: string;
}

export class QueryOrderDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  gradeCategory?: string;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  dateFrom?: string;

  @IsString()
  @IsOptional()
  dateTo?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;
}
