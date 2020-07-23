// 云函数入口文件
const cloud = require('wx-server-sdk')
// 导入tfjs-node依赖
const tf = require('@tensorflow/tfjs')

cloud.init({
  env: 'hartest-b7yls',
  traceUser: true,
})

// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()

  //获取云存储中模型文件的临时URL地址 
  const fileList = ['cloud://hartest-b7yls.6861-hartest-b7yls-1302325027/LSTMmodel/model.json']
  const filelist_urls = await cloud.getTempFileURL({ fileList: fileList })
  console.log(filelist_urls)
  const Model_file = filelist_urls.fileList[0]['tempFileURL']

  //调用tfjs中API加载模型
  const model = await tf.loadLayersModel(Model_file)
  //模拟输入数据
  // const input = [tf.zeros([1, 128, 6])]
  var data = event.data;
  const input = tf.tensor3d(data);
  //推理并打印
  var prediction = model.predict(input);
  var result = prediction.arraySync();
  result = result[0];
  var max_value = Math.max.apply(Math, result);
  var index = result.indexOf(max_value);
  var action = '';
  if(index == 0){
    action = "站立";
  }else if(index == 1){
    action = "扩胸";
  }else if(index == 2){
    action = "深蹲";
  }else if(index == 3){
    action = "行走"
  }else if(index == 4){
    action = "仰卧起坐"
  }
  return await {
    input:input,
    action:action,
  }
}