/**
 * 网络请求工具类
 * 封装微信请求API，统一处理请求头、认证和错误处理
 */

const config = require('../config');
const auth = require('./auth');

/**
 * 发送HTTP请求
 * @param {Object} options 请求配置
 * @param {string} options.url 请求地址
 * @param {string} options.method 请求方法
 * @param {Object} options.data 请求数据
 * @param {boolean} options.needAuth 是否需要认证
 * @returns {Promise} 请求结果Promise
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 构建完整URL
    const url = options.url.startsWith('http') 
      ? options.url 
      : `${config.apiBaseUrl}${options.url}`;
    
    // 准备请求头
    const header = options.header || {};
    
    // 需要认证的接口自动添加Token
    if (options.needAuth !== false) {
      const token = auth.getToken();
      if (token) {
        header['Authorization'] = `Bearer ${token}`;
      } else {
        // 未登录，跳转到登录页
        wx.navigateTo({
          url: '/pages/login/login'
        });
        reject(new Error('未登录'));
        return;
      }
    }
    
    // 发起请求
    wx.request({
      url,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      success: (res) => {
        // 约定：服务端返回格式为 { code: 0, data: {}, message: '' }
        // code为0表示成功，其他表示失败
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data.data);
          } else {
            // 业务错误处理
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            });
            reject(new Error(res.data.message || '请求失败'));
          }
        } else if (res.statusCode === 401) {
          // 认证失败，清理Token并跳转登录
          auth.clearToken();
          wx.navigateTo({
            url: '/pages/login/login'
          });
          reject(new Error('认证失败'));
        } else {
          // HTTP错误
          wx.showToast({
            title: `请求异常: ${res.statusCode}`,
            icon: 'none'
          });
          reject(new Error(`请求异常: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        // 网络错误
        wx.showToast({
          title: '网络异常，请检查网络连接',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

/**
 * GET请求
 * @param {string} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 其他选项
 */
const get = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  });
};

/**
 * POST请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他选项
 */
const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
};

/**
 * PUT请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他选项
 */
const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
};

/**
 * DELETE请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他选项
 */
const del = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  });
};

module.exports = {
  request,
  get,
  post,
  put,
  delete: del
}; 