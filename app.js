// app.js
const auth = require('./utils/auth');

App({
  onLaunch() {
    // 检查登录状态
    if (auth.isLoggedIn()) {
      // 刷新用户信息
      this.refreshUserInfo();
    }
    
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    
    // 计算安全区域
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    const { statusBarHeight } = systemInfo;
    const navBarHeight = (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height;
    
    this.globalData.navBarHeight = navBarHeight;
    this.globalData.statusBarHeight = statusBarHeight;
    this.globalData.safeTop = statusBarHeight;
    this.globalData.safeBottom = systemInfo.screenHeight - systemInfo.safeArea.bottom;
  },
  
  /**
   * 刷新用户信息
   */
  async refreshUserInfo() {
    try {
      // 请求服务器获取最新用户信息
      const userApi = require('./utils/api').user;
      const userInfo = await userApi.getUserInfo();
      
      // 更新本地存储
      auth.setCurrentUser(userInfo);
      
      // 更新全局数据
      this.globalData.userInfo = userInfo;
    } catch (err) {
      console.error('刷新用户信息失败', err);
    }
  },
  
  globalData: {
    userInfo: null,
    systemInfo: null,
    navBarHeight: 0,
    statusBarHeight: 0,
    safeTop: 0,
    safeBottom: 0
  }
})
