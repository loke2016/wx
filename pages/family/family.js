const api = require('../../utils/api');
const auth = require('../../utils/auth');

Page({
  data: {
    hasFamily: false,
    familyInfo: {},
    members: [],
    isOwner: false,
    currentUser: {},
    loading: false,
    showInviteModal: false,
    showJoinModal: false,
    inviteCode: '',
    inputInviteCode: ''
  },
  
  onLoad() {
    this.loadUserInfo();
    this.loadFamilyInfo();
  },
  
  async loadUserInfo() {
    const currentUser = auth.getCurrentUser();
    
    this.setData({
      currentUser
    });
  },
  
  async loadFamilyInfo() {
    this.setData({ loading: true });
    
    try {
      const members = await api.family.getMembers();
      
      if (members && members.length > 0) {
        // 检查当前用户是否是家庭管理员
        const currentUser = this.data.currentUser;
        const isOwner = members.some(member => 
          member.id === currentUser.id && member.isOwner
        );
        
        // 提取家庭信息
        const familyInfo = {
          id: members[0].familyId,
          name: members[0].familyName
        };
        
        this.setData({
          hasFamily: true,
          familyInfo,
          members,
          isOwner,
          loading: false
        });
      } else {
        this.setData({
          hasFamily: false,
          loading: false
        });
      }
    } catch (err) {
      console.error('加载家庭信息失败', err);
      
      this.setData({
        hasFamily: false,
        loading: false
      });
      
      wx.showToast({
        title: '加载家庭信息失败',
        icon: 'none'
      });
    }
  },
  
  onBack() {
    wx.navigateBack();
  },
  
  async onCreateFamily() {
    this.setData({ loading: true });
    
    try {
      // 调用创建家庭接口（此处假设与生成邀请码接口相同）
      const result = await api.family.generateInviteCode();
      
      // 刷新家庭信息
      await this.loadFamilyInfo();
      
      wx.showToast({
        title: '创建家庭成功',
        icon: 'success'
      });
    } catch (err) {
      console.error('创建家庭失败', err);
      
      this.setData({ loading: false });
      
      wx.showToast({
        title: '创建家庭失败',
        icon: 'none'
      });
    }
  },
  
  onJoinFamily() {
    this.setData({
      showJoinModal: true,
      inputInviteCode: ''
    });
  },
  
  onInviteCodeInput(e) {
    this.setData({
      inputInviteCode: e.detail.value
    });
  },
  
  async onJoinWithInviteCode() {
    const { inputInviteCode } = this.data;
    
    if (!inputInviteCode) {
      wx.showToast({
        title: '请输入邀请码',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      await api.family.joinFamily(inputInviteCode);
      
      // 关闭模态框
      this.setData({
        showJoinModal: false,
        inputInviteCode: ''
      });
      
      // 刷新家庭信息
      await this.loadFamilyInfo();
      
      wx.showToast({
        title: '加入家庭成功',
        icon: 'success'
      });
    } catch (err) {
      console.error('加入家庭失败', err);
      
      this.setData({ loading: false });
      
      wx.showToast({
        title: '加入家庭失败，邀请码可能无效',
        icon: 'none'
      });
    }
  },
  
  async onGenerateInvite() {
    this.setData({ loading: true });
    
    try {
      const result = await api.family.generateInviteCode();
      
      this.setData({
        inviteCode: result.code,
        showInviteModal: true,
        loading: false
      });
    } catch (err) {
      console.error('生成邀请码失败', err);
      
      this.setData({ loading: false });
      
      wx.showToast({
        title: '生成邀请码失败',
        icon: 'none'
      });
    }
  },
  
  onCopyInviteCode() {
    const { inviteCode } = this.data;
    
    wx.setClipboardData({
      data: inviteCode,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  },
  
  async onRemoveMember(e) {
    const { id } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '移除成员',
      content: '确定要移除此成员吗？',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          
          try {
            await api.family.removeMember(id);
            
            // 刷新家庭信息
            await this.loadFamilyInfo();
            
            wx.showToast({
              title: '移除成功',
              icon: 'success'
            });
          } catch (err) {
            console.error('移除成员失败', err);
            
            this.setData({ loading: false });
            
            wx.showToast({
              title: '移除成员失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },
  
  onCloseInviteModal() {
    this.setData({
      showInviteModal: false
    });
  },
  
  onCloseJoinModal() {
    this.setData({
      showJoinModal: false
    });
  }
}) 