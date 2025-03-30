const api = require('../../utils/api');
const auth = require('../../utils/auth');

Page({
  data: {
    userInfo: {},
    familyInfo: {},
    storageStats: {
      usedSize: '0 MB',
      totalSize: '0 MB',
      usagePercent: 0,
      photoCount: 0
    },
    loading: false,
    showStorageStats: false
  },
  
  onLoad() {
    this.checkAuth();
  },
  
  onShow() {
    if (auth.isLoggedIn()) {
      this.loadUserInfo();
    }
  },
  
  checkAuth() {
    if (!auth.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    } else {
      this.loadUserInfo();
    }
  },
  
  async loadUserInfo() {
    this.setData({ loading: true });
    
    try {
      // 获取用户信息
      const userInfo = auth.getCurrentUser();
      
      this.setData({
        userInfo,
        loading: false
      });
      
      // 加载家庭信息
      await this.loadFamilyInfo();
    } catch (err) {
      console.error('加载用户信息失败', err);
      
      this.setData({ loading: false });
    }
  },
  
  async loadFamilyInfo() {
    try {
      const members = await api.family.getMembers();
      
      if (members && members.length > 0) {
        // 提取家庭信息
        const familyInfo = {
          id: members[0].familyId,
          name: members[0].familyName,
          memberCount: members.length
        };
        
        this.setData({ familyInfo });
      }
    } catch (err) {
      console.error('加载家庭信息失败', err);
    }
  },
  
  onGoToFamily() {
    wx.navigateTo({
      url: '/pages/family/family'
    });
  },
  
  onGoToMyPhotos() {
    // 跳转到我的照片页面，还没有实现，这里可以考虑使用首页筛选
    wx.showToast({
      title: '该功能即将上线',
      icon: 'none'
    });
  },
  
  async onViewStorageStats() {
    this.setData({ loading: true });
    
    try {
      const stats = await api.storage.getStorageStats();
      
      // 格式化存储数据
      this.setData({
        storageStats: {
          usedSize: this.formatSize(stats.usedSize),
          totalSize: this.formatSize(stats.totalSize),
          usagePercent: Math.min(Math.round(stats.usedSize / stats.totalSize * 100), 100),
          photoCount: stats.photoCount
        },
        showStorageStats: true,
        loading: false
      });
    } catch (err) {
      console.error('加载存储统计失败', err);
      
      this.setData({ loading: false });
      
      wx.showToast({
        title: '加载存储统计失败',
        icon: 'none'
      });
    }
  },
  
  onCloseStorageStats() {
    this.setData({
      showStorageStats: false
    });
  },
  
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
  },
  
  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          auth.logout();
          
          wx.redirectTo({
            url: '/pages/login/login'
          });
        }
      }
    });
  }
}) 