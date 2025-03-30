/**
 * 全局配置文件
 */
const config = {
  // API基础URL，生产环境请更换为实际地址
  apiBaseUrl: 'https://api.familyalbum.com',
  
  // 图片上传配置
  upload: {
    maxSize: 10 * 1024 * 1024, // 单张图片最大尺寸（10MB）
    maxCount: 9, // 单次最大上传数量
    chunkSize: 1024 * 1024, // 分块大小（1MB）
  },
  
  // 缓存配置
  cache: {
    // 图片缓存过期时间（24小时）
    imageExpire: 24 * 60 * 60 * 1000,
  },
  
  // 安全配置
  security: {
    // JWT Token 存储键名
    tokenKey: 'family_album_token',
  }
};

module.exports = config; 