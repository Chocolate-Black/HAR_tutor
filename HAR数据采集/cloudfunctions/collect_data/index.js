// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: "chocolateblack-l7jcm",
})
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  if(event.activity =='standing'){
    return await db.collection('standing').add({
      data:{
        name: event.name,
        hands: event.hands,
        interval: event.samplingInterval,
        time_span: event.time_span,
        xacc: event.xacc,
        yacc: event.yacc,
        zacc: event.zacc,
        xgyr: event.xgyr,
        ygyr: event.ygyr,
        zgyr: event.zgyr,
      }

    })
  } else if (event.activity == 'walk'){
    return await db.collection('walk').add({
      data: {
        name: event.name,
        hands: event.hands,
        interval: event.samplingInterval,
        time_span: event.time_span,
        xacc: event.xacc,
        yacc: event.yacc,
        zacc: event.zacc,
        xgyr: event.xgyr,
        ygyr: event.ygyr,
        zgyr: event.zgyr,
      }
    })
  } else if (event.activity == 'squat'){
    return await db.collection('squat').add({
      data: {
        name: event.name,
        hands: event.hands,
        interval: event.samplingInterval,
        time_span: event.time_span,
        xacc: event.xacc,
        yacc: event.yacc,
        zacc: event.zacc,
        xgyr: event.xgyr,
        ygyr: event.ygyr,
        zgyr: event.zgyr,
      }
    })
  }else if(event.activity == 'expand'){
    return await db.collection('expand').add({
      data: {
        name: event.name,
        hands: event.hands,
        interval: event.samplingInterval,
        time_span: event.time_span,
        xacc: event.xacc,
        yacc: event.yacc,
        zacc: event.zacc,
        xgyr: event.xgyr,
        ygyr: event.ygyr,
        zgyr: event.zgyr,
      }
    })
  }else if(event.activity == 'situp'){
    return await db.collection('situp').add({
      data: {
        name: event.name,
        hands: event.hands,
        interval: event.samplingInterval,
        time_span: event.time_span,
        xacc: event.xacc,
        yacc: event.yacc,
        zacc: event.zacc,
        xgyr: event.xgyr,
        ygyr: event.ygyr,
        zgyr: event.zgyr,
      }
    })
  } else if (event.activity == 'RussianTwist'){
    return await db.collection('Russian_twist').add({
      data: {
        name: event.name,
        hands: event.hands,
        interval: event.samplingInterval,
        time_span: event.time_span,
        xacc: event.xacc,
        yacc: event.yacc,
        zacc: event.zacc,
        xgyr: event.xgyr,
        ygyr: event.ygyr,
        zgyr: event.zgyr,
      }
    })
  }
}