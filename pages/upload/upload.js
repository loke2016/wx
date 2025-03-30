const imageUtil = require('../../utils/image');
const api = require('../../utils/api');
const auth = require('../../utils/auth');
const config = require('../../config');

Page({
  data: {
    selectedPhotos: [],
    maxCount: config.upload.maxCount,
    description: '',
    uploading: false,
    uploadProgress: 0,
    uploadedCount: 0
  },
  
  onLoad() {
    this.checkAuth();
  },
  
  checkAuth() {
    if (!auth.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
  },
  
  onChoosePhoto() {
    const { selectedPhotos, maxCount } = this.data;
    const remainCount = maxCount - selectedPhotos.length;
    
    if (remainCount <= 0) {
      wx.showToast({
        title: `最多只能上传${maxCount}张照片`,
        icon: 'none'
      });
      return;
    }
    
    imageUtil.chooseImage({
      count: remainCount
    }).then(files => {
      this.setData({
        selectedPhotos: [...selectedPhotos, ...files]
      });
    }).catch(err => {
      console.error('选择图片失败', err);
    });
  },
  
  onDeletePhoto(e) {
    const { index } = e.currentTarget.dataset;
    const { selectedPhotos } = this.data;
    
    selectedPhotos.splice(index, 1);
    
    this.setData({
      selectedPhotos
    });
  },
  
  onPreviewPhoto(e) {
    const { index } = e.currentTarget.dataset;
    const { selectedPhotos } = this.data;
    
    const urls = selectedPhotos.map(photo => photo.path);
    
    wx.previewImage({
      current: urls[index],
      urls
    });
  },
  
  onDescriptionInput(e) {
    this.setData({
      description: e.detail.value
    });
  },
  
  async onUploadPhotos() {
    const { selectedPhotos, description } = this.data;
    
    if (selectedPhotos.length === 0) {
      return;
    }
    
    this.setData({
      uploading: true,
      uploadProgress: 0,
      uploadedCount: 0
    });
    
    try {
      // 上传照片
      const result = await imageUtil.uploadImages(selectedPhotos, {
        description
      }, this.onUploadProgress);
      
      // 检查上传结果
      const failedCount = result.filter(item => !item.success).length;
      
      if (failedCount === 0) {
        wx.showToast({
          title: '上传成功',
          icon: 'success'
        });
        
        // 清空状态
        this.setData({
          selectedPhotos: [],
          description: '',
          uploading: false
        });
        
        // 跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 1500);
      } else {
        wx.showToast({
          title: `上传完成，但有${failedCount}张照片上传失败`,
          icon: 'none'
        });
        
        this.setData({
          uploading: false
        });
      }
    } catch (err) {
      console.error('上传照片失败', err);
      
      wx.showToast({
        title: '上传照片失败',
        icon: 'none'
      });
      
      this.setData({
        uploading: false
      });
    }
  },
  
  onUploadProgress(progress) {
    const { totalFiles, completedFiles } = progress;
    
    this.setData({
      uploadProgress: completedFiles / totalFiles,
      uploadedCount: completedFiles
    });
  }
}) 