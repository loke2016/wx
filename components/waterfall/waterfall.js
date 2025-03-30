Component({
  properties: {
    list: {
      type: Array,
      value: [],
      observer: function(newVal) {
        if (newVal && newVal.length > 0) {
          this.calculateLayout();
        }
      }
    },
    column: {
      type: Number,
      value: 2
    },
    gutter: {
      type: Number,
      value: 20
    }
  },
  
  data: {
    leftList: [],
    rightList: [],
    leftHeight: 0,
    rightHeight: 0,
    itemWidth: 0
  },
  
  lifetimes: {
    attached() {
      this.getSystemInfo();
    }
  },
  
  methods: {
    getSystemInfo() {
      const systemInfo = wx.getSystemInfoSync();
      const screenWidth = systemInfo.windowWidth;
      const { column, gutter } = this.properties;
      
      // 计算每个项目的宽度
      const itemWidth = (screenWidth - (column + 1) * gutter) / column;
      
      this.setData({
        itemWidth
      });
    },
    
    calculateLayout() {
      const { list, column } = this.properties;
      if (!list || list.length === 0) return;
      
      let leftList = [];
      let rightList = [];
      let leftHeight = 0;
      let rightHeight = 0;
      
      // 为简化实现，只支持两列布局
      list.forEach(item => {
        const itemHeight = this.calculateItemHeight(item);
        
        if (leftHeight <= rightHeight) {
          leftList.push({
            ...item,
            height: itemHeight
          });
          leftHeight += itemHeight;
        } else {
          rightList.push({
            ...item,
            height: itemHeight
          });
          rightHeight += itemHeight;
        }
      });
      
      this.setData({
        leftList,
        rightList,
        leftHeight,
        rightHeight
      });
    },
    
    calculateItemHeight(item) {
      const { itemWidth } = this.data;
      const { width, height } = item;
      
      // 如果有宽高信息，按比例计算
      if (width && height) {
        return Math.floor(itemWidth * height / width);
      }
      
      // 没有宽高信息，返回默认高度
      return Math.floor(itemWidth * 1.2);
    },
    
    onPhotoTap(e) {
      const { photo } = e.detail;
      this.triggerEvent('tapitem', { photo });
    }
  }
}) 