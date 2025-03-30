const api = require('../../utils/api');
const auth = require('../../utils/auth');

Page({
  data: {
    loading: false
  },
  
  onLoad() {
    // 检查是否已登录
    if (auth.isLoggedIn()) {
      this.redirectToHome();
    }
  },
  
  async onGetUserInfo(e) {
    if (e.detail.userInfo) {
      this.setData({ loading: true });
      
      try {
        // 获取用户信息
        const userInfo = e.detail.userInfo;
        
        // 获取登录凭证
        const code = await auth.wxLogin();
        
        // 调用登录接口
        const loginResult = await api.user.login(code, userInfo);
        
        // 保存登录信息
        auth.setToken(loginResult.token);
        auth.setCurrentUser(loginResult.userInfo);
        
        // 登录成功
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
        
        // 跳转首页
        setTimeout(() => {
          this.redirectToHome();
        }, 1500);
      } catch (err) {
        console.error('登录失败', err);
        
        this.setData({ loading: false });
        
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      }
    } else {
      wx.showToast({
        title: '您拒绝了授权，无法登录',
        icon: 'none'
      });
    }
  },
  
  redirectToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },
  
  onViewPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '本应用尊重并保护所有使用服务用户的个人隐私权。为了给您提供更准确、更有个性化的服务，本应用会按照本隐私权政策的规定使用和披露您的个人信息。',
      showCancel: false
    });
  }
}) 