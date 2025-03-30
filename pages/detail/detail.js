const api = require('../../utils/api');
const auth = require('../../utils/auth');
const imageUtil = require('../../utils/image');

Page({
  data: {
    photoId: '',
    photo: {},
    comments: [],
    commentContent: '',
    commentFocus: false,
    loading: true,
    imageLoading: true,
    isOwner: false
  },
  
  onLoad(options) {
    const { id } = options;
    
    this.setData({
      photoId: id
    });
    
    this.loadPhotoDetail();
  },
  
  async loadPhotoDetail() {
    this.setData({ loading: true });
    
    try {
      const photoDetail = await api.photo.getPhotoDetail(this.data.photoId);
      
      // 检查当前用户是否是照片上传者
      const currentUser = auth.getCurrentUser();
      const isOwner = currentUser && currentUser.id === photoDetail.user.id;
      
      this.setData({
        photo: photoDetail,
        comments: photoDetail.comments || [],
        loading: false,
        isOwner
      });
    } catch (err) {
      console.error('加载照片详情失败', err);
      
      wx.showToast({
        title: '加载照片详情失败',
        icon: 'none'
      });
      
      this.setData({ loading: false });
    }
  },
  
  onImageLoad() {
    this.setData({ imageLoading: false });
  },
  
  onBack() {
    wx.navigateBack();
  },
  
  onPreviewImage() {
    const { photo } = this.data;
    
    wx.previewImage({
      current: photo.url,
      urls: [photo.url]
    });
  },
  
  async onToggleLike() {
    const { photo, photoId } = this.data;
    
    try {
      // 提前更新UI状态，优化体验
      const newIsLiked = !photo.isLiked;
      const newLikeCount = newIsLiked 
        ? (photo.likeCount || 0) + 1 
        : Math.max((photo.likeCount || 0) - 1, 0);
      
      this.setData({
        'photo.isLiked': newIsLiked,
        'photo.likeCount': newLikeCount
      });
      
      // 发送请求
      await api.photo.toggleLike(photoId, newIsLiked);
    } catch (err) {
      console.error('点赞操作失败', err);
      
      // 恢复原始状态
      this.setData({
        'photo.isLiked': photo.isLiked,
        'photo.likeCount': photo.likeCount
      });
      
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  },
  
  onFocusComment() {
    this.setData({ commentFocus: true });
  },
  
  onCommentInput(e) {
    this.setData({
      commentContent: e.detail.value
    });
  },
  
  async onSubmitComment() {
    const { photoId, commentContent, comments } = this.data;
    
    if (!commentContent.trim()) {
      return;
    }
    
    try {
      const result = await api.photo.addComment(photoId, commentContent);
      
      // 添加新评论到列表
      this.setData({
        comments: [result, ...comments],
        commentContent: '',
        'photo.commentCount': (this.data.photo.commentCount || 0) + 1
      });
      
      wx.showToast({
        title: '评论成功',
        icon: 'success'
      });
    } catch (err) {
      console.error('发送评论失败', err);
      
      wx.showToast({
        title: '评论失败，请重试',
        icon: 'none'
      });
    }
  },
  
  async onDelete() {
    const { photoId } = this.data;
    
    wx.showModal({
      title: '删除照片',
      content: '确定要删除这张照片吗？删除后无法恢复。',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.photo.deletePhoto(photoId);
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            
            // 返回上一页
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } catch (err) {
            console.error('删除照片失败', err);
            
            wx.showToast({
              title: '删除失败，请重试',
              icon: 'none'
            });
          }
        }
      }
    });
  }
}) 