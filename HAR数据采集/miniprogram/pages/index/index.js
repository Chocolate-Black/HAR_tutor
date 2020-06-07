// miniprogram/pages/index/index.js
import Toast from '../../components/@vant/weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    minute: '0' + 0,   // 分
    second: '0' + 0,   // 秒
    tenms: '0' + 0,   // 10*ms
    sample_list: ['20ms/次', '60ms/次','200ms/次'],
    show:false,
    samplingInterval:20, //采样次数/s
    hands:"left", //左手or右手
    name:"", //实验者姓名
    activity:'', //动作类别
    time:5000, //采集数据时长
    setInter:'',
    xacc:'', //六轴数据
    yacc:'',
    zacc:'',
    xgyr:'',
    ygyr:'',
    zgyr:'',
  },

  showPopup() {
    this.setData({ show: true });
  },
  onClose(event) {
    this.setData({ show: false });
  },
  onConfirm(event){
    var time = 20;
    if (event.detail.value == "60ms/次"){
      this.setData({
        show: false,
        samplingInterval:60,
      });
      console.log("samplingInterval is changed!")
    } else if (event.detail.value == "200ms/次"){
      this.setData({
        show: false,
        samplingInterval: 200,
      });
      console.log("samplingInterval is changed!")
    }
  },
  changeHands(event){
    this.setData({
      hands:event.detail
    })
  },
  nameChange(event){
    this.setData({
      name: event.detail
    })
  },

  onLoad: function (options) {
    
  },
  setSampling(event){
    console.log(event.detail)
  },
  // 计时器
  startSetInter(event) {
    const that = this;
    var second = that.data.second;
    var minute = that.data.minute;
    second = 0;
    that.setData({
      activity: event.currentTarget.dataset.activity,
    })

    if(that.data.samplingInterval == 20){
      wx.startAccelerometer({
        interval:'game'  //20ms
      })
      wx.startGyroscope({
        interval:'game'
      })
    }else if(that.data.samplingInterval == 60){
      wx.startAccelerometer({
        interval:'ui' //60ms
      })
      wx.startGyroscope({
        interval: 'ui'
      })
    }else{
      wx.startAccelerometer({
        interval:'normal' //200ms
      })
      wx.startGyroscope({
        interval: 'normal'
      })
    }
    var xacc_records = new Array();
    var yacc_records = new Array();
    var zacc_records = new Array();
    var xgry_records = new Array();
    var ygry_records = new Array();
    var zgry_records = new Array();

    var acc_index = 0;
    var gyr_index = 0;

    // 记录数据
    if (acc_index == 0) {
      wx.onAccelerometerChange(function (res) {
        xacc_records[acc_index] = res.x
        yacc_records[acc_index] = res.y
        zacc_records[acc_index] = res.z
        that.setData({
          xacc: xacc_records,
          yacc: yacc_records,
          zacc: zacc_records,
        })
        acc_index++
      })
      wx.onGyroscopeChange(function (res) {
        xgry_records[gyr_index] = res.x
        ygry_records[gyr_index] = res.y
        zgry_records[gyr_index] = res.z
        that.setData({
          xgyr: xgry_records,
          ygyr: ygry_records,
          zgyr: zgry_records,
        })
        gyr_index++
      })
    }
    that.data.setInter = setInterval(function () {  // 设置定时器
      second++
      if (second >= 60) {
        second = 0  //  大于等于60分归零
        minute++
        if (minute < 10) {
            // 少于10补零
          that.setData({
            minute: '0' + minute
          })
        } else {
          that.setData({
            minute: minute
          })
        }
      }
      if (second < 10) {
        // 少于10补零
        that.setData({
          second: '0' + second
         })
      } else {
        that.setData({
          second: second
        })
      }
      if (that.data.time == 0) {
        that.endSetInter();
        console.log("time over!")
      }else{
        var numVal = that.data.time - 1000;
        that.setData({
          time: numVal,
        });
      }
    }, 1000)
  },

  endSetInter: function () {
    var that = this;
    // 停止监听
    wx.stopAccelerometer({
      success(res){
        console.log("acc is stopped!")
        console.log(that.data.xacc)
      }
    })
    wx.stopGyroscope({
      success(res){
        console.log("gyr is stopped!")
        console.log(that.data.xgyr)
      }
    })
    clearInterval(that.data.setInter)
    // 调用云函数，上传数据
    wx.cloud.callFunction({
      name: 'collect_data',
      data: {
        name:that.data.name,
        samplingInterval:that.data.samplingInterval,
        hands:that.data.hands,
        time_span:that.data.xacc.length * that.data.samplingInterval,
        activity:that.data.activity,
        xacc:that.data.xacc,
        yacc:that.data.yacc,
        zacc:that.data.zacc,
        xgyr:that.data.xgyr,
        ygyr:that.data.ygyr,
        zgyr:that.data.zgyr,
        setInter: '',
      },
      success: res => {
        console.log("add ok!", res);
      },
      fail: err => {
        console.log("error!")
        console.log(err)
      }
    })
    // 重新设置数据
    that.setData({
      minute: '0' + 0,   // 分
      second: '0' + 0,   // 秒
      tenms: '0' + 0,   // 10*ms
      time:5000,
      xacc: '',
      yacc: '',
      zacc: '',
      xgyr: '',
      ygyr: '',
      zgyr: '',
    });

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