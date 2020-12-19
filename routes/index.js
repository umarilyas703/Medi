var express = require('express');
const { all } = require('../app');
var router = express.Router();
var firebaseApp = require('../firebaseApp');
var fetch = require('node-fetch');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const cameras = [];
  await firebaseApp.initalize().database().ref().child('camera').orderByChild('UserKey').once('value',function(snapshot){
    const allCamera = snapshot.val()
    const keys = Object.keys(allCamera)
    for(let k of keys){
      let camera = allCamera[k];
      cameras.push({
        CameraID:k,
        CameraName:camera.CameraName,
        RTSP:camera.RTSP,
        UserKey:camera.UserKey,
        FireDetectedTimes:0,
        FrameNotReads:0
      });
    }
    console.log(cameras.length);
  });

  let counter = 0
  var i,j,temparray,chunk = ((cameras.length/2)<10?5:10) ;
  for (i=0,j=cameras.length; i<j; i+=chunk) {
      temparray = cameras.slice(i,i+chunk);
      counter = counter + 1;
      console.log("Sending Batch Number: "+counter);
      // console.log(temparray);
      // Handle Response from Django Server
      const API = "http://192.168.10.21:8000/get_batch"
      const body = {
        Cameras:temparray
      }
      const data = {
        method:"POST",
        body:JSON.stringify(body),
        header:{
          "Content-Type":"application/json"
        }
      }
      await fetch(API,data).then(res=>res.json()).then(async result=>{
        console.log("Response of Batch "+counter+" Received!");
        const Result = JSON.parse(result.Result);
        let index = 0;
        for(let pred of Result){
          pred = parseInt(pred);
          switch(pred){
            case -1:
              temparray[index].FrameNotReads = temparray[index].FrameNotReads + 1;
              if(temparray[index].FrameNotReads>=5){
                // Send Not Responding Notification
                await firebaseApp.initalize().database().ref().child('notification').child(temparray[index].UserKey).update({
                  Notification:temparray[index].CameraName+" might not be working!",
                  RTSP:temparray[index].CameraName,
                  Body:"We were not able to receive more than 5 frames for this camera",
                  CameraName:temparray[index].CameraName
                });
              }
              break;
            case 0:
              temparray[index].FireDetectedTimes = 0;
              break;
            case 1:
              temparray[index].FireDetectedTimes = temparray[index].FireDetectedTimes + 0.5;
              break;
            case 2:
              temparray[index].FireDetectedTimes = temparray[index].FireDetectedTimes + 1;
              break;
          }
          console.log(temparray);
          if(temparray[index].FireDetectedTimes>=0){
            console.log('Sending Notification');
            const Notification = {
              Notification:"Fire Detected In Camera " + temparray[index].CameraName,
              RTSP:temparray[index].RTSP,
              Body:"Click on this notification to see live feed",
              CameraName:temparray[index].CameraName
            }
            console.log(Notification)
            await firebaseApp.initalize().database().ref().child('notifications').child(temparray[index].UserKey).update(Notification);
          }
          index = index +1;
        }
      }).catch(err=>{
        console.log(err);
      })
    }
});

module.exports = router;
