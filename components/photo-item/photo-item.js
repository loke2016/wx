const imageUtil = require('../../utils/image');

Component({
  properties: {
    photo: {
      type: Object,
      value: {}
    },
    height: {
      type: Number,
      value: 0
    }
  },
  
  data: {
    imagePath: '',
    imageHeight: 0,
    imageLoading: true
  },
  
  lifetimes: {
    attached() {
      this.loadImage();
    }
  },
  
  methods: {
    async loadImage() {
      const { photo } = this.properties;
      if (!photo || !photo.thumbnailUrl) return;
      
      this.setData({ imageLoading: true });
      try {
        // 获取缓存图片路径
        const imagePath = await imageUtil.getCachedImagePath(photo.thumbnailUrl);
        this.setData({ 
          imagePath,
          imageLoading: false
        });
      } catch (err) {
        console.error('加载图片失败', err);
        this.setData({ imageLoading: false });
      }
    },
    
    onTap() {
      const { photo } = this.properties;
      this.triggerEvent('tap', { photo });
    }
  }
}) 