/**
 * 图片处理工具类
 * 处理图片选择、上传和压缩
 */

const config = require('../config');
const request = require('./request');

/**
 * 选择图片
 * @param {Object} options 选择图片参数
 * @param {number} options.count 最大选择数量，默认9
 * @param {Array<string>} options.sizeType 图片尺寸类型，默认['original', 'compressed']
 * @param {Array<string>} options.sourceType 图片来源，默认['album', 'camera']
 * @returns {Promise<Array>} 选择的图片临时路径列表
 */
const chooseImage = (options = {}) => {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: options.count || config.upload.maxCount,
      mediaType: ['image'],
      sizeType: options.sizeType || ['original', 'compressed'],
      sourceType: options.sourceType || ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles.map(file => ({
          path: file.tempFilePath,
          size: file.size
        }));
        resolve(tempFiles);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * 预览图片
 * @param {string} current 当前显示的图片链接
 * @param {Array<string>} urls 需要预览的图片链接列表
 */
const previewImage = (current, urls) => {
  wx.previewImage({
    current,
    urls
  });
};

/**
 * 图片上传前检查
 * @param {Object} file 文件对象
 * @returns {boolean} 是否通过检查
 */
const checkBeforeUpload = (file) => {
  // 检查文件大小
  if (file.size > config.upload.maxSize) {
    wx.showToast({
      title: `图片大小不能超过${config.upload.maxSize / 1024 / 1024}MB`,
      icon: 'none'
    });
    return false;
  }
  return true;
};

/**
 * 上传单个图片
 * @param {Object} file 文件对象，包含path和size属性
 * @param {Object} additionalData 附加数据，会与图片一起上传
 * @returns {Promise<Object>} 上传结果
 */
const uploadImage = (file, additionalData = {}) => {
  if (!checkBeforeUpload(file)) {
    return Promise.reject(new Error('文件检查未通过'));
  }
  
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${config.apiBaseUrl}/api/upload`,
      filePath: file.path,
      name: 'file',
      formData: additionalData,
      header: {
        'Authorization': `Bearer ${wx.getStorageSync(config.security.tokenKey)}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data);
            if (data.code === 0) {
              resolve(data.data);
            } else {
              wx.showToast({
                title: data.message || '上传失败',
                icon: 'none'
              });
              reject(new Error(data.message || '上传失败'));
            }
          } catch (e) {
            reject(new Error('解析上传结果失败'));
          }
        } else {
          wx.showToast({
            title: `上传失败: ${res.statusCode}`,
            icon: 'none'
          });
          reject(new Error(`上传失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络异常，上传失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

/**
 * 分块上传大文件
 * @param {Object} file 文件对象，包含path和size属性
 * @param {Object} options 上传选项
 * @param {Function} progressCallback 进度回调函数
 * @returns {Promise<Object>} 上传结果
 */
const uploadLargeImage = async (file, options = {}, progressCallback) => {
  if (!checkBeforeUpload(file)) {
    return Promise.reject(new Error('文件检查未通过'));
  }
  
  // 文件信息
  const fileManager = wx.getFileSystemManager();
  
  try {
    // 1. 创建上传任务
    const task = await request.post('/api/upload/create', {
      filename: file.path.split('/').pop(),
      size: file.size,
      type: 'image',
      ...options
    });
    
    const { uploadId, chunkSize = config.upload.chunkSize } = task;
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    // 2. 分块上传
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      
      // 读取文件块
      const fileData = await new Promise((resolve, reject) => {
        fileManager.readFile({
          filePath: file.path,
          position: start,
          length: end - start,
          success: (res) => {
            resolve(res.data);
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
      
      // 上传分块
      await request.post('/api/upload/chunk', {
        uploadId,
        chunkIndex: i,
        totalChunks
      }, {
        header: {
          'Content-Type': 'multipart/form-data'
        },
        data: fileData
      });
      
      // 回调进度
      if (typeof progressCallback === 'function') {
        progressCallback({
          progress: (i + 1) / totalChunks,
          totalChunks,
          currentChunk: i + 1
        });
      }
    }
    
    // 3. 完成上传
    const result = await request.post('/api/upload/complete', {
      uploadId
    });
    
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * 批量上传图片
 * @param {Array<Object>} files 文件对象数组
 * @param {Object} options 上传选项
 * @param {Function} progressCallback 进度回调函数
 * @returns {Promise<Array>} 上传结果数组
 */
const uploadImages = async (files, options = {}, progressCallback) => {
  const results = [];
  let completedCount = 0;
  
  for (const file of files) {
    try {
      let result;
      // 根据文件大小决定使用普通上传还是分块上传
      if (file.size > config.upload.chunkSize) {
        result = await uploadLargeImage(file, options, (progress) => {
          if (typeof progressCallback === 'function') {
            progressCallback({
              file,
              ...progress,
              totalFiles: files.length,
              completedFiles: completedCount
            });
          }
        });
      } else {
        result = await uploadImage(file, options);
      }
      
      results.push({
        success: true,
        file,
        result
      });
      
      completedCount++;
      if (typeof progressCallback === 'function') {
        progressCallback({
          file,
          progress: 1,
          totalFiles: files.length,
          completedFiles: completedCount
        });
      }
    } catch (error) {
      results.push({
        success: false,
        file,
        error
      });
      
      completedCount++;
      if (typeof progressCallback === 'function') {
        progressCallback({
          file,
          error,
          totalFiles: files.length,
          completedFiles: completedCount
        });
      }
    }
  }
  
  return results;
};

/**
 * 获取缓存的图片路径
 * @param {string} url 图片原始URL
 * @returns {Promise<string>} 本地缓存路径或原始URL
 */
const getCachedImagePath = async (url) => {
  const cacheKey = `image_cache_${url}`;
  const cacheData = wx.getStorageSync(cacheKey);
  
  // 检查缓存是否存在且未过期
  if (cacheData && cacheData.path && cacheData.expireAt > Date.now()) {
    try {
      await new Promise((resolve, reject) => {
        wx.getFileInfo({
          filePath: cacheData.path,
          success: resolve,
          fail: reject
        });
      });
      // 文件存在，返回缓存路径
      return cacheData.path;
    } catch (e) {
      // 文件不存在，删除缓存记录
      wx.removeStorageSync(cacheKey);
    }
  }
  
  // 下载并缓存
  try {
    const result = await new Promise((resolve, reject) => {
      wx.downloadFile({
        url,
        success: resolve,
        fail: reject
      });
    });
    
    if (result.statusCode === 200) {
      // 保存缓存记录
      wx.setStorageSync(cacheKey, {
        path: result.tempFilePath,
        expireAt: Date.now() + config.cache.imageExpire
      });
      return result.tempFilePath;
    }
  } catch (e) {
    console.error('下载图片失败', e);
  }
  
  // 失败时返回原始URL
  return url;
};

module.exports = {
  chooseImage,
  previewImage,
  uploadImage,
  uploadLargeImage,
  uploadImages,
  getCachedImagePath
}; 