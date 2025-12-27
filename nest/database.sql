-- 家教信息平台数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `jiajiao` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `jiajiao`;

-- 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` varchar(20) NOT NULL COMMENT '订单编号',
  `title` varchar(100) NOT NULL COMMENT '标题',
  `district` varchar(50) NOT NULL COMMENT '区域',
  `school` varchar(100) DEFAULT NULL COMMENT '学校',
  `address` varchar(200) NOT NULL COMMENT '详细地址',
  `gradeCategory` varchar(20) NOT NULL COMMENT '年级分类（小学/初中/高中）',
  `grade` varchar(20) NOT NULL COMMENT '年级',
  `subjects` text NOT NULL COMMENT '科目（逗号分隔）',
  `score` varchar(50) DEFAULT NULL COMMENT '成绩情况',
  `frequency` varchar(50) DEFAULT NULL COMMENT '上课频率',
  `availableTimes` text DEFAULT NULL COMMENT '可用时间（逗号分隔）',
  `availableTimesText` varchar(200) DEFAULT NULL COMMENT '可用时间文本',
  `price` varchar(100) DEFAULT NULL COMMENT '课时费',
  `teacherType` varchar(50) DEFAULT NULL COMMENT '教师类型要求',
  `contact` varchar(20) DEFAULT NULL COMMENT '联系方式',
  `note` text DEFAULT NULL COMMENT '备注',
  `status` varchar(10) NOT NULL DEFAULT 'active' COMMENT '状态（active/inactive）',
  `date` date NOT NULL COMMENT '发布日期',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_district` (`district`),
  KEY `idx_grade` (`gradeCategory`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='家教订单表';

-- 管理员表
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(100) NOT NULL COMMENT '密码（bcrypt加密）',
  `role` varchar(20) NOT NULL DEFAULT 'normal' COMMENT '角色（super/normal）',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- 配置表
CREATE TABLE IF NOT EXISTS `configs` (
  `key` varchar(50) NOT NULL COMMENT '配置键',
  `value` text NOT NULL COMMENT '配置值（JSON格式）',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 密码使用bcrypt加密，这里是 123456 的加密结果
INSERT INTO `admins` (`username`, `password`, `role`) VALUES 
('admin', '$2a$10$GDd6GDlqC65Rikdc/8Cx/OaNOt2gn7DcLwnG0myKLJtLQ7sYKu0ji', 'super')
ON DUPLICATE KEY UPDATE `username` = `username`;