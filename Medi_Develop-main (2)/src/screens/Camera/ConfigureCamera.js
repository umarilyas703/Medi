import React,{useState,useEffect} from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput, Modal, ImageBackground, ScrollView } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import CommonStyles from '../../CommonStyles';
import theme from '../../themes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FirebaseFunction from '../../FirebaseFunctions';
import { DataTable } from 'react-native-paper';

const ConfigureCamera = (props) => {
    const [userKey, setUserKey] = useState("");
    const [RTSP,setRTSP] = useState("");
    const [cameraName,setCameraName] = useState("");
    const [activity,setActivity] = useState(false);
    const [showCamera,setShowCamera] = useState(false);
    const [camers,setCameras] = useState([]);
    const [cameraActivity,setCameraActivity] = useState(false);

    useEffect(()=>{
        async function getUserKey(){
            const key = await AsyncStorage.getItem('@UserKey');
            if(key) setUserKey(key);
        }
        getUserKey();
    },[]);

    async function saveCameraDetails(){
        setActivity(true);
        const Camera = {
            RTSP:RTSP,
            CameraName:cameraName,
            UserKey:userKey
        }
        await FirebaseFunction.addCamera(Camera);
        setActivity(false);
    }

    let okArray = [false,false];
    function executeRule(ruleType,value){
        let length = value.length;
        if(length==0){
            return <View></View>
        }
        else{
            switch(ruleType){
                case "RTSP":
                    const protocols = ['https://','mms://','rtsp://','http://'];
                    for(let p of protocols){
                        if(value.toLowerCase().includes(p)){
                            okArray[0] = true;
                            return <MaterialIcons name="done-all" size={50} color={theme.success} style={CommonStyles.IconStyles}/>
                        }
                    }
                    okArray[0] = false;
                    return <MaterialIcons name="error" size={40} color={theme.error} style={CommonStyles.IconStyles}/>
                case "CameraName":
                    if(value.length>3){
                        okArray[0] = true;
                        return <MaterialIcons name="done-all" size={50} color={theme.success} style={CommonStyles.IconStyles}/>
                    }
                    else{
                        okArray[0] = false;
                        return <MaterialIcons name="error" size={40} color={theme.error} style={CommonStyles.IconStyles}/>
                    }
            }
        }
    }
    return(
        <View>
            <Modal 
                visible={showCamera}
                onRequestClose={()=>setShowCamera(false)}
                onDismiss={()=>setShowCamera(false)}
                transparent
            >
                <View style={{flex:1, backgroundColor:'rgba(0,0,0,0.6)'}}>
                    <View style={{height:'60%',width:'90%',alignSelf:'center',backgroundColor:'white',marginTop:'30%',borderRadius:20}}>
                        <ImageBackground 
                                source={require("../../../assets/FirstAid/header.png")}
                                style={{width:'100%',height:'62%',borderRadius:20}}
                                resizeMode={"cover"}    
                        >
                            <Text style={[CommonStyles.MainHeading,{fontSize:22,textAlign:'center',paddingTop:15,paddingBottom:1,color:'white'}]}>Your Cameras</Text>
                            {camers.length>0?(
                            <DataTable style={{marginTop:50}}>
                                <DataTable.Header>
                                    <DataTable.Title >Name </DataTable.Title>
                                    <DataTable.Title>RTSP URL</DataTable.Title>
                                </DataTable.Header>                          
                                <ScrollView>
                                    {camers.map((item)=>(
                                        <DataTable.Row key={item.ID + Math.random().toFixed(5)}>
                                            <DataTable.Cell>{item.CameraName}</DataTable.Cell>
                                            <DataTable.Cell>
                                                <TouchableOpacity onPress={()=>{
                                                    setShowCamera(false);
                                                    props.navigation.navigate('Stream',{
                                                        RTSP:item.RTSP,
                                                        CameraName:item.CameraName
                                                    });
                                                }}>
                                                    <Text 
                                                    >{item.RTSP.substring(0,20)}</Text>
                                                </TouchableOpacity>
                                            </DataTable.Cell>
                                        </DataTable.Row>
                                    ))}
                                </ScrollView>
                            </DataTable>
                            ):(
                              <ActivityIndicator 
                                    size={30}
                                    color={theme.secondary}
                                    style={{
                                        alignSelf:'center'
                                    }}
                              />  
                            )}
                        </ImageBackground>
                    </View>
                    <TouchableOpacity onPress={()=>setShowCamera(false)}>
                        <Text style={{
                            backgroundColor:theme.secondary,
                            borderWidth:1.5,
                            borderRadius:20,
                            marginTop:'2%',
                            borderColor:theme.secondary,
                            width:'90%',
                            alignSelf:'center',
                            padding:10,
                            color:'white',
                            fontWeight:'bold',
                            textAlign:'center',
                        }}>Close </Text>
                    </TouchableOpacity>

                </View>
            </Modal>
            <Text style={[CommonStyles.MainHeading,{paddingTop:50}]}>Configure Camera Here</Text>
            <View>
                <View style={CommonStyles.OtherView}>
                        <TextInput 
                            value={RTSP}
                            placeholder="Enter The RTSP URL Of IP Camera"
                            placeholderTextColor={theme.white}
                            onChangeText={(text)=>setRTSP(text)}
                            style={CommonStyles.TextStyles}
                        />
                        {RTSP?executeRule("RTSP",RTSP):null}
                </View>
                <Text style={CommonStyles.RestrictionText}>Get RTSP URL from Camera Manual</Text>

                <View style={CommonStyles.OtherView}>
                        <TextInput 
                            value={cameraName}
                            placeholder="Enter Camera Name"
                            placeholderTextColor={theme.white}
                            onChangeText={(text)=>setCameraName(text)}
                            style={CommonStyles.TextStyles}
                        />
                        {cameraName?executeRule("CameraName",cameraName):null}
                </View>
                <Text style={CommonStyles.RestrictionText}>Add A Camera Name</Text>

            </View>
            <TouchableOpacity style={CommonStyles.SaveButton} onPress={async()=>{
                    await saveCameraDetails();
                }}>
                    {activity==false?(
                        <Text style={CommonStyles.SaveText}>Save Camera</Text>
                    ):(
                        <ActivityIndicator size={60} color={theme.white} style={CommonStyles.SaveText}/>
                    )}
            </TouchableOpacity>
            <TouchableOpacity style={[CommonStyles.SaveButton,{marginTop:'5%',width:'70%'}]} onPress={async()=>{
                    setCameraActivity(true);
                    const cameras = await FirebaseFunction.getCamers(userKey);
                    console.log(cameras);
                    setCameras(cameras);
                    setShowCamera(true);
                    setCameraActivity(false);
                }}>
                    {cameraActivity===false?(
                        <Text style={CommonStyles.SaveText}>View My Camera's</Text>
                    ):(
                        <ActivityIndicator size={60} color={theme.white} style={CommonStyles.SaveText}/>
                    )}
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({

});
export default ConfigureCamera;