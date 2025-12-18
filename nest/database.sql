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

-- 插入默认管理员（密码：123456）
-- 密码使用bcrypt加密，这里是 123456 的加密结果
INSERT INTO `admins` (`username`, `password`, `role`) VALUES 
('admin', '$2b$10$rQnM1.mKpHxPxVPVPVPVPe1234567890123456789012345678901234', 'super')
ON DUPLICATE KEY UPDATE `username` = `username`;

-- 插入默认配置
INSERT INTO `configs` (`key`, `value`) VALUES 
('districts', '["南山区","福田区","罗湖区","宝安区","龙岗区","龙华区","光明区","坪山区","盐田区","大鹏新区"]'),
('grades', '{"小学":["一年级","二年级","三年级","四年级","五年级","六年级"],"初中":["初一","初二","初三"],"高中":["高一","高二","高三"]}'),
('subjects', '["语文","数学","英语","物理","化学","生物","政治","历史","地理","全科"]'),
('teacherTypes', '["在职教师","机构老师","大学生","研究生","不限"]'),
('contactInfo', '{"wechat":"","phone":"","qq":""}')
ON DUPLICATE KEY UPDATE `key` = `key`;

-- 插入示例订单数据
INSERT INTO `orders` (`id`, `title`, `district`, `school`, `address`, `gradeCategory`, `grade`, `subjects`, `score`, `frequency`, `availableTimes`, `price`, `teacherType`, `contact`, `note`, `status`, `date`) VALUES 
('JJ20231201001', '南山区初二数学辅导', '南山区', '南山实验学校', '南山区科技园附近', '初中', '初二', '数学', '中等偏下', '每周2次', '周六上午,周日下午', '150-200元/小时', '大学生', NULL, '希望能提高数学成绩', 'active', CURDATE()),
('JJ20231201002', '福田区高一物理化学', '福田区', '深圳中学', '福田区莲花路', '高中', '高一', '物理,化学', '中等', '每周3次', '周一晚上,周三晚上,周六全天', '200-250元/小时', '在职教师', NULL, '需要有高中教学经验', 'active', CURDATE()),
('JJ20231201003', '宝安区小学全科辅导', '宝安区', NULL, '宝安中心区', '小学', '四年级', '语文,数学,英语', '良好', '每周2次', '周末', '100-120元/小时', '不限', NULL, '主要是作业辅导', 'active', CURDATE())
ON DUPLICATE KEY UPDATE `id` = `id`;
