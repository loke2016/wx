/**
 * 认证工具类
 * 处理用户登录、Token存储和校验
 */

const config = require('../config');

/**
 * 获取存储的Token
 * @returns {string|null} 用户Token或null
 */
const getToken = () => {
  return wx.getStorageSync(config.security.tokenKey) || null;
};

/**
 * 保存Token到存储
 * @param {string} token 用户Token
 */
const setToken = (token) => {
  wx.setStorageSync(config.security.tokenKey, token);
};

/**
 * 清除Token
 */
const clearToken = () => {
  wx.removeStorageSync(config.security.tokenKey);
};

/**
 * 检查是否已登录
 * @returns {boolean} 是否已登录
 */
const isLoggedIn = () => {
  return !!getToken();
};

/**
 * 微信登录获取code
 * @returns {Promise<string>} 登录凭证code
 */
const wxLogin = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          resolve(res.code);
        } else {
          reject(new Error('微信登录失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * 获取用户信息
 * @returns {Promise<Object>} 用户信息
 */
const getUserProfile = () => {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        resolve(res.userInfo);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * 获取当前用户信息
 * @returns {Object|null} 用户信息或null
 */
const getCurrentUser = () => {
  return wx.getStorageSync('userInfo') || null;
};

/**
 * 保存用户信息
 * @param {Object} userInfo 用户信息
 */
const setCurrentUser = (userInfo) => {
  wx.setStorageSync('userInfo', userInfo);
};

/**
 * 清除用户信息
 */
const clearCurrentUser = () => {
  wx.removeStorageSync('userInfo');
};

/**
 * 登出
 */
const logout = () => {
  clearToken();
  clearCurrentUser();
};

module.exports = {
  getToken,
  setToken,
  clearToken,
  isLoggedIn,
  wxLogin,
  getUserProfile,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  logout
}; 