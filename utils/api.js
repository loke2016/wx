/**
 * API接口封装
 * 封装所有后端接口调用
 */

const request = require('./request');

/**
 * 用户相关接口
 */
const userApi = {
  /**
   * 微信登录
   * @param {string} code 微信登录code
   * @param {Object} userInfo 用户信息
   * @returns {Promise<Object>} 登录结果，包含token和用户信息
   */
  login: (code, userInfo) => {
    return request.post('/api/login', { code, userInfo }, { needAuth: false });
  },
  
  /**
   * 获取当前用户信息
   * @returns {Promise<Object>} 用户信息
   */
  getUserInfo: () => {
    return request.get('/api/user/info');
  },
  
  /**
   * 更新用户信息
   * @param {Object} userInfo 用户信息
   * @returns {Promise<Object>} 更新结果
   */
  updateUserInfo: (userInfo) => {
    return request.put('/api/user/info', userInfo);
  }
};

/**
 * 家庭成员相关接口
 */
const familyApi = {
  /**
   * 获取家庭成员列表
   * @returns {Promise<Array>} 家庭成员列表
   */
  getMembers: () => {
    return request.get('/api/members');
  },
  
  /**
   * 生成家庭邀请码
   * @returns {Promise<Object>} 邀请码信息
   */
  generateInviteCode: () => {
    return request.post('/api/members/invite');
  },
  
  /**
   * 加入家庭
   * @param {string} inviteCode 邀请码
   * @returns {Promise<Object>} 加入结果
   */
  joinFamily: (inviteCode) => {
    return request.post('/api/members/join', { inviteCode });
  },
  
  /**
   * 移除家庭成员
   * @param {string} memberId 成员ID
   * @returns {Promise<Object>} 操作结果
   */
  removeMember: (memberId) => {
    return request.delete(`/api/members/${memberId}`);
  }
};

/**
 * 相册照片相关接口
 */
const photoApi = {
  /**
   * 获取照片列表
   * @param {Object} params 查询参数
   * @param {number} params.page 页码
   * @param {number} params.pageSize 每页数量
   * @param {string} params.sortBy 排序字段
   * @param {string} params.sortOrder 排序方向
   * @returns {Promise<Object>} 照片列表和分页信息
   */
  getPhotos: (params = {}) => {
    return request.get('/api/photos', params);
  },
  
  /**
   * 获取照片详情
   * @param {string} photoId 照片ID
   * @returns {Promise<Object>} 照片详情
   */
  getPhotoDetail: (photoId) => {
    return request.get(`/api/photo/${photoId}`);
  },
  
  /**
   * 添加照片评论
   * @param {string} photoId 照片ID
   * @param {string} content 评论内容
   * @returns {Promise<Object>} 评论结果
   */
  addComment: (photoId, content) => {
    return request.post(`/api/photo/${photoId}/comment`, { content });
  },
  
  /**
   * 给照片点赞/取消点赞
   * @param {string} photoId 照片ID
   * @param {boolean} isLike 是否点赞
   * @returns {Promise<Object>} 操作结果
   */
  toggleLike: (photoId, isLike) => {
    return request.post(`/api/photo/${photoId}/like`, { isLike });
  },
  
  /**
   * 删除照片
   * @param {string} photoId 照片ID
   * @returns {Promise<Object>} 操作结果
   */
  deletePhoto: (photoId) => {
    return request.delete(`/api/photo/${photoId}`);
  },
  
  /**
   * 更新照片信息
   * @param {string} photoId 照片ID
   * @param {Object} photoInfo 照片信息
   * @returns {Promise<Object>} 更新结果
   */
  updatePhoto: (photoId, photoInfo) => {
    return request.put(`/api/photo/${photoId}`, photoInfo);
  }
};

/**
 * 存储空间接口
 */
const storageApi = {
  /**
   * 获取存储空间统计
   * @returns {Promise<Object>} 存储空间统计信息
   */
  getStorageStats: () => {
    return request.get('/api/storage/stats');
  }
};

module.exports = {
  user: userApi,
  family: familyApi,
  photo: photoApi,
  storage: storageApi
}; 