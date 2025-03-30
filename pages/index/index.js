const api = require('../../utils/api');
const auth = require('../../utils/auth');

Page({
  data: {
    photoList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    refreshing: false
  },
  
  onLoad() {
    this.checkAuth();
  },
  
  onShow() {
    // 如果已登录且无数据，加载数据
    if (auth.isLoggedIn() && this.data.photoList.length === 0) {
      this.loadPhotos();
    }
  },
  
  onPullDownRefresh() {
    this.refreshPhotos();
    wx.stopPullDownRefresh();
  },
  
  checkAuth() {
    if (!auth.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    } else {
      this.loadPhotos();
    }
  },
  
  async loadPhotos() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });
    
    try {
      const { page, pageSize } = this.data;
      
      const res = await api.photo.getPhotos({
        page,
        pageSize,
        sortBy: 'createTime',
        sortOrder: 'desc'
      });
      
      this.setData({
        photoList: [...this.data.photoList, ...res.list],
        hasMore: res.hasMore,
        page: page + 1,
        loading: false
      });
    } catch (err) {
      console.error('加载照片失败', err);
      this.setData({ loading: false });
      
      wx.showToast({
        title: '加载照片失败',
        icon: 'none'
      });
    }
  },
  
  async refreshPhotos() {
    this.setData({
      refreshing: true,
      photoList: [],
      page: 1,
      hasMore: true
    });
    
    await this.loadPhotos();
    
    this.setData({
      refreshing: false
    });
  },
  
  onLoadMore() {
    this.loadPhotos();
  },
  
  onPhotoTap(e) {
    const { photo } = e.detail;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${photo.id}`
    });
  },
  
  onRefresh() {
    this.refreshPhotos();
  }
}) 