import React,{useState,useEffect} from 'react';
import { View, Text,TouchableOpacity, Linking} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import CommonStyles from '../../CommonStyles';
import theme from '../../themes';
import { WebView } from 'react-native-webview';
import FirebaseFunctions from '../../FirebaseFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CameraStream = (props) => {
    const RTSP = props.route.params.RTSP
    const CameraName = props.route.params.CameraName;
    const showEmergencyButton = props.route.params.showEmergencyButton;
    const userKey = props.route.params.UserKey
    const [image,setImage] = useState(null);
    console.log(global.DjangoServer);
    const url = global.DjangoServer+"get_frame?RTSP=" + encodeURIComponent(RTSP);
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <div style="width: 100%;height: 100%;">
            <img src="${url}" id="video-stream" style="height: 100%;width:100%;resize: vertical;"/>
        </div>
    </body>
    </html>`;
    useEffect(()=>{

    },[])
    return(
        <View style={{flex:1}}>
            <Text style={[CommonStyles.MainHeading,{paddingTop:60}]}>Camera Live Stream</Text>
            <Text style={[CommonStyles.MainHeading,{fontSize:26,alignSelf:'center',color:theme.secondary}]}>{CameraName} Camera</Text>
            <View style={{width:'90%',height:'40%',alignSelf:'center',borderRadius:20,elevation:5}}>
                <WebView
                    source={{ html: html }}
                    javaScriptEnabled
                    startInLoadingState={true}
                    containerStyle={{
                        borderRadius:20,
                        backgroundColor:'#f2f2f2'
                    }}
                />        
            </View>
            <TouchableOpacity style={[CommonStyles.SaveButton,{width:'90%',alignSelf:'center',marginTop:30,backgroundColor:theme.tabBar,elevation:5}]}
                onPress={()=>{
                    FirebaseFunctions.setUpNotification(userKey,props);
                    props.navigation.goBack()
                }}
            >
                <Text style={CommonStyles.SaveText}>
                    Close Live Stream
                </Text>
            </TouchableOpacity>
            {showEmergencyButton&&(
                <TouchableOpacity style={[CommonStyles.SaveButton,{width:'90%',alignSelf:'center',marginTop:30,backgroundColor:theme.tabBar,elevation:5}]}
                    onPress={()=>{
                        Linking.openURL(`tel:1122`)
                    }}
                >
                    <Text style={CommonStyles.SaveText}>
                        Call Emergency Service
                    </Text>
                </TouchableOpacity>
            )}
      </View>
    );
}

export default CameraStream;