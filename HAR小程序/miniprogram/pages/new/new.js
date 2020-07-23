// miniprogram/pages/new/new.js
const innerAudioContext = wx.createInnerAudioContext();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xacc: '',
    yacc: '',
    zacc: '',
    xgyr: '',
    ygyr: '',
    zgyr: '',
    action: '',
    flag:0,
    walk:0,
    squat:0,
    expand:0,
    situp:0,
    int_walk:0,
    int_squat:0,
    int_expand:0,
    int_situp:0,
  },
  mean_filter:function(data){ //均值滤波
    var length = data.length
    var i = 0;
    for(i=0;i<length;i++){
      if(i==0){
        data[i] = (data[i] + data[i+1] + data[length-1])/3;
      }else if(i==length-1){
        data[i] = (data[i] + data[i-1] + data[0])/3;
      }else{
        data[i] = (data[i] + data[i+1] + data[i-1])/3;
      }
    }
    return data;
  },
  butter_worth:function(data){ //巴特沃斯滤波
    const a = [1, 0.98532524, 0.97384933, 0.38635656, 0.11116384, 0.01126351];
    const b = [0.1083737, 0.54186851, 1.08373703, 1.08373703, 0.54186851, 0.1083737];
    var xbuf = [0,0,0,0,0,0];
    var ybuf = [0,0,0,0,0,0];
    var length = data.length;
    var new_data = new Array(128);
    var i = 0;
    var j = 0;
    for(i=0;i<length;i++){
      for(j=5;j>0;j--){
        xbuf[j] = xbuf[j-1];
        ybuf[j] = ybuf[j-1];
      }
      xbuf[0] = data[i];
      ybuf[0] = 0;
      for(j=1;j<6;j++){
        ybuf[0] = ybuf[0] + b[j]*xbuf[j];
        ybuf[0] = ybuf[0] - a[j]*ybuf[j];
      }
      ybuf[0] = ybuf[0] + b[0]*xbuf[0]
      new_data[i] = ybuf[0]
    }
    return new_data;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.startAccelerometer({
      interval: 'game'  //20ms
    })
    wx.startGyroscope({
      interval: 'game'
    })
    var xacc_records = new Array(128);
    var yacc_records = new Array(128);
    var zacc_records = new Array(128);
    var xgry_records = new Array(128);
    var ygry_records = new Array(128);
    var zgry_records = new Array(128);
    
    var i = 0;
    for(i=0;i<128;i++){
      xacc_records[i] = 0;
      yacc_records[i] = 0;
      zacc_records[i] = 0;
      xgry_records[i] = 0;
      ygry_records[i] = 0;
      zgry_records[i] = 0;
    }
    this.setData({
      xacc:xacc_records,
      yacc:yacc_records,
      zacc:zacc_records,
      xgyr:xgry_records,
      ygyr:ygry_records,
      zgyr:zgry_records,
    })

    var that = this;
    wx.onAccelerometerChange(function (res) {
      var xacc_records = that.data.xacc;
      var yacc_records = that.data.yacc;
      var zacc_records = that.data.zacc;
      var xacc = res.x;
      var yacc = res.y;
      var zacc = res.z;
      var i = 0;
      // 存储数据
      for(i=127;i>0;i--){
        xacc_records[i] = xacc_records[i - 1];
        yacc_records[i] = yacc_records[i - 1];
        zacc_records[i] = zacc_records[i - 1];
      }
      xacc_records[0] = xacc;
      yacc_records[0] = yacc;
      zacc_records[0] = zacc;
      // 设置
      that.setData({
        xacc:xacc_records,
        yacc:yacc_records,
        zacc:zacc_records,
      })
    })
    wx.onGyroscopeChange(function (res) {
      var xgyr_records = that.data.xgyr;
      var ygyr_records = that.data.ygyr;
      var zgyr_records = that.data.zgyr;
      var xgyr = res.x;
      var ygyr = res.y;
      var zgyr = res.z;
      var i = 0;
     
      // 存储数据
      for (i = 127; i > 0; i--) {
        xgyr_records[i] = xgyr_records[i - 1];
        ygyr_records[i] = ygyr_records[i - 1];
        zgyr_records[i] = zgyr_records[i - 1];
      }
      xgyr_records[0] = xgyr;
      ygyr_records[0] = ygyr;
      zgyr_records[0] = zgyr;
      // 设置
      that.setData({
        xgyr: xgyr_records,
        ygyr: ygyr_records,
        zgyr: zgyr_records,
      })
    })
    that.predict();


  },
  predict(){
    var that = this;

    that.data.setInter = setInterval(async function () {  // 设置定时器
      var all_data = new Array(6);
      var data_buff = new Array(6);
      var i = 0;
      all_data[0] = that.data.xacc;
      all_data[1] = that.data.yacc;
      all_data[2] = that.data.zacc;
      all_data[3] = that.data.xgyr;
      all_data[4] = that.data.ygyr;
      all_data[5] = that.data.zgyr;
      data_buff[0] = that.data.xacc;
      data_buff[1] = that.data.yacc;
      data_buff[2] = that.data.zacc;
      data_buff[3] = that.data.xgyr;
      data_buff[4] = that.data.ygyr;
      data_buff[5] = that.data.zgyr;
      // 均值滤波
      for(i=0;i<6;i++){
        var j = 0;
        for(j=0;j<128;j++){
          if(j == 0){
            all_data[i][j] = (data_buff[i][j] + data_buff[i][j+1] + data_buff[i][127])/3;
          }else if(j == 127){
            all_data[i][j] = (data_buff[i][j] + data_buff[i][j-1] + data_buff[i][0])/3;
          }else{
            all_data[i][j] = (data_buff[i][j] + data_buff[i][j+1] +data_buff[i][j-1])/3;
          }
        }
      }

      // 巴特沃斯滤波
      for(i=0;i<6;i++){
        all_data[i] = that.butter_worth(all_data[i]);
      }


      var input_data = [];
      for (i = 0; i < all_data[0].length; i++) {
        input_data[i] = []
      }
      for (i = 0; i < all_data.length; i++) {
        var j = 0;
        for (j = 0; j < all_data[0].length; j++) {
          input_data[j][i] = all_data[i][j];
        }
      }
      input_data = [input_data];
      if(that.data.flag == 1){
        //调用云函数，进行预测
        wx.cloud.callFunction({
          name: 'LSTMModelInfer',
          data: {
            data: input_data,
          },
          success: res => {
            console.log(res);
            that.setData({
              action: res.result.action,
            })
            var action = res.result.action;
            if (action == '站立') {
              innerAudioContext.src = "cloud://hartest-b7yls.6861-hartest-b7yls-1302325027/voice/站立.mp3";
              innerAudioContext.play();
            } else if (action == '深蹲') {
              innerAudioContext.src = 'cloud://hartest-b7yls.6861-hartest-b7yls-1302325027/voice/深蹲.mp3';
              innerAudioContext.play();
              that.setData({
                squat: that.data.squat + 1.621,
              })
              var value = parseInt(that.data.squat);
              that.setData({
                int_squat: value,
              })
            } else if (action == '扩胸') {
              innerAudioContext.src = "cloud://hartest-b7yls.6861-hartest-b7yls-1302325027/voice/扩胸.mp3";
              innerAudioContext.play();
              that.setData({
                expand: that.data.expand + 1.8011,
              })
              var value = parseInt(that.data.expand);
              that.setData({
                int_expand: value,
              })
            } else if (action == '仰卧起坐') {
              innerAudioContext.src = "cloud://hartest-b7yls.6861-hartest-b7yls-1302325027/voice/仰卧起坐.mp3";
              innerAudioContext.play();
              that.setData({
                situp:that.data.situp + 1.2044,
              })
              var value = parseInt(that.data.situp);
              that.setData({
                int_situp:value,
              })
            } else if (action = '行走') {
              innerAudioContext.src = "cloud://hartest-b7yls.6861-hartest-b7yls-1302325027/voice/行走.mp3";
              innerAudioContext.play();
              that.setData({
                walk: that.data.walk + 2.7106,
              })
              var value = parseInt(that.data.walk);
              that.setData({
                int_walk: value,
              })
            }
          },
          fail: err => {
            console.log("error!")
            console.log(err)
          }
        })
      }
    }, 2560)
  },
  start(){
    var that = this; //允许调用云函数
    that.setData({
      flag:1,
    })

  },
  stop(){ //禁止调用云函数
    var that = this;
    that.setData({
      flag:0,
    })
  },
  reset(){ //数据重置
    var that = this;
    that.setData({
      flag: 0,
      walk: 0,
      squat: 0,
      expand: 0,
      situp: 0,
      int_walk: 0,
      int_squat: 0,
      int_expand: 0,
      int_situp: 0,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})