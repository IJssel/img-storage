// const { apiUrl, apiAppId, apiAppSecret } = getApp().config


Page({
  /**
   * 页面的初始数据
   */
  data: {
    image: 'https://hbimg.huabanimg.com/dd0f2a1486e73d6fc7d10ce91816c8e43730714a50dd0-qgN5GZ_fw658',
    showTips: true,
    result: null

  },

  /**
   * 分析照片
   */
  detectImage (src) {
    const that = this

    // 取消之前的结果显示
    that.setData({ result: null })

    // loading
    wx.showLoading({ title: '加载中...' })

    // 将图片上传至 AI 服务端点
    wx.uploadFile({
      url: 'https://ai.qq.com/cgi-bin/appdemo_detectface',
      name: 'image_file',
      filePath: src,
      success (res) {
        // 解析 JSON
        const result = JSON.parse(res.data)

        if (result.ret === 0) {
          // 成功获取分析结果
          that.setData({ result: result.data.face[0] })
        } else {
          // 检测失败
          wx.showToast({ icon: 'none', title: '找不到你的小脸蛋喽～' })
        }

        // end loading
        wx.hideLoading()
      }
    })
  },

  /**
   * 获取照片
   */
  getImage(type = 'camera') {
    const that = this

    // 调用系统 API 选择或拍摄照片
    wx.chooseImage({
      sourceType: [type], // camera | album
      sizeType: ['compressed'], // original | compressed
      count: 1,
      success(res) {
        // 取照片对象
        const image = res.tempFiles[0]

        // 图片过大
        if (image.size > 1024 * 1000) {
          return wx.showToast({ icon: 'none', title: '图片过大, 请重新拍张小的！' })
        }

        // 显示到界面上
        that.setData({ image: image.path })

        // 分析检测人脸
        that.detectImage(image.path)
      }
    })

    // 关闭 Tips 显示
    this.setData({ showTips: false })
  },

  /**
   * 按钮事件处理函数
   */
  handleClick (e) {
    if (e.type === 'tap') {
      // 短按拍照为拍摄照片
      this.getImage()
    } else if (e.type === 'longpress') {
      // 长按拍照为选择照片
      this.getImage('album')
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    //const isUsed = wx.getStorageSync('is_used')
    if (isUsed) return
    // 第一次使用显示 Tips
    this.setData({ showTips: true })
    // 并记住用使用过了
    wx.setStorageSync('is_used', false)
  },
  // 页面渲染完成 
  onReady: function () {
    var circleCount = 0;
    // 心跳的外框动画 
    this.animationMiddleHeaderItem = wx.createAnimation({
      duration: 1000, // 以毫秒为单位 
      timingFunction: 'linear',
      delay: 100,
      transformOrigin: '50% 50%',
      success: function (res) {
      }
    });
    setInterval(function () {
      if (circleCount % 2 == 0) {
        this.animationMiddleHeaderItem.scale(1.15).step();
      } else {
        this.animationMiddleHeaderItem.scale(1.0).step();
      }
      this.setData({
        animationMiddleHeaderItem: this.animationMiddleHeaderItem.export()
      });
      circleCount++;
      if (circleCount == 1000) {
        circleCount = 0;
      }
    }.bind(this), 1000);

    this.randDomText();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 文字闪烁动画
  randDomText: function () {//endText最终显示文字，texts闪烁文字，time延迟时间,spacetime闪烁频率,stime闪烁周期
    var that = this;
    for (var i = 0; i < rangArr.length; i++) {
      var rang = rangArr[i];
      rang['runTime'] = 0;   //累计运行时间
      rang['isRun'] = false; //是否已经开始在执行了
      rang['isStop'] = false;//是否已经执行完毕了
    };

    animateinterval = setInterval(function () {
      var stop = true;
      var showData = {};
      for (var i = 0; i < rangArr.length; i++) {
        var rangXX = rangArr[i];
        if (!rangXX['isStop']) {
          stop = false; //只要有一个没执行完就 就继续执行 
          rangXX['runTime'] = rangXX['runTime'] + allSpaceTime; //累计执行时间开始叠加 
          var changeWord = false; //是否修改词
          if (!rangXX['isRun']) { //如果还没开始跑，判断下时间是否已经到开始跑的时间
            if (rangXX['runTime'] >= rangXX['beginTime']) {//
              rangXX['isRun'] = true;//到开始跑时间了
            } else {
              continue;
            }
          } else if (rangXX['runTime'] >= (rangXX['stime'] + rangXX['beginTime'])) {   //如果当前队列的已经执行完毕，则显示最后一次的数据         
            rangXX['isStop'] = true;
            if (rangXX['lastWord'] != rangXX['endText']) {
              rangXX['lastWord'] = rangXX['endText'];
              showData['text' + (i + 1)] = rangXX['endText'];//显示最后的词
            }
            continue;
          }
          var index = Math.floor((rangXX['runTime'] - rangXX['beginTime']) / rangXX['spacetime']) % rangXX['texts'].length;
          var showWord = rangXX['texts'][index];
          if (rangXX['lastWord'] != showWord) {
            rangXX['lastWord'] = showWord;
            showData['text' + (i + 1)] = showWord;
          }

        } else {
          continue;
        }
      }

      if (JSON.stringify(showData) != "{}") {
        that.setData(showData);
      }
      if (stop) {
        clearInterval(animateinterval);
      }
    }, allSpaceTime);
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {
    if (!this.data.result) return
    // 如果有分析结果，则分享
    return { title: `刚刚测了我的颜值「${this.data.result.beauty}」你也赶紧来试试吧！` }
  }
})
