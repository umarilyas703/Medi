import React,{useState,useEffect} from 'react';
import { View, Text, TouchableOpacity, ImageBackground, DeviceEventEmitter, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import CommonStyles from '../../../CommonStyles';
import LocationService from '../../../components/Services/Location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SocketIOClient from 'socket.io-client';

let LocationEvent = null;
let _userData = null;
let _userLocation = null;
let _accept = null;
const EnableLocation = (props) => {
    const [serviceEnabled,setService] = useState('false');
    const [userKey,setUserKey] = useState("");
    const [userDetails,setUserDetails] = useState({});
    const [driverKey,setDriverKey] = useState("");
    const [driverStatus,setDriverStatus] = useState("");
    const [userData,setUserData] = useState(null);
    const [userLocation,setUserLocation] = useState(null);
    function connectDriverSocket(){
        let driverSocket = SocketIOClient.connect(global.ServerAPI+'unassigned-drivers',{
            port:3000,
            autoConnect:true,
            forceNew:true
        });
        driverSocket.on('connect',async()=>{
            LocationEvent = DeviceEventEmitter.addListener('UpdatedLocation',({coords})=>{
                const API = global.ServerAPI + 'locations/updateLocation';
                coords = Object.assign(coords, { driver_key: driverKey, socketID: driverSocket.id });
                const data = {
                    method: 'PUT',
                    body: JSON.stringify(coords),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                fetch(API, data).then(res => res.json()).then(result => {
                    console.log('Driver Location Uppdated!');
                }).catch(async err => {
                    console.log("Failed To Update Driver's Location");
                    console.log(err);
                    await AsyncStorage.setItem('@ServiceEnabled','false');
                    setService('false');
                    LocationService.stopLocationService();
                    if(LocationEvent) LocationEvent.remove();
                });
            });
        });
        driverSocket.on('driver-connected',(driverId)=>{
            console.log('driver-connected');
            // console.log(driverSocket.id==driverId);
            console.log('Above are keys boolean');
        });
        driverSocket.on('new-request',async(body)=>{
            const {userData, locationData} = JSON.parse(body);
            _userData = userData;
            _userLocation = locationData;
            const driverNotificationSetting = await AsyncStorage.getItem('@driverNotifications');
            let runLocalNotification = false;
            if(driverNotificationSetting){
                console.log(driverNotificationSetting + ' DRIVER SETTINGS');
                if(driverNotificationSetting==="true"){
                    runLocalNotification = true
                }
            }
            if(runLocalNotification){
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: 'New Ride Request For Help!',
                        body: "Request From "+userData.name,
                    },
                    trigger: null,
                });
            }
        });
        _accept = function(){
            console.log('RUNNING DRIVER ACCEPT')
            const Body = {
                UserKey:_userData.key,
                UserSocket:_userData.socketId,
                DriverKey:driverKey,
                DriverSocket:driverSocket.id
            }
            console.log(_userData);
            console.log(Body);
            driverSocket.emit('driver-accepted',(JSON.stringify(Body)));
        }
        driverSocket.on('startRide',()=>{

        });
        driverSocket.on('payment-received',()=>{

        });
        driverSocket.on('disconnect',()=>{
            driverSocket = null;
        });
        return driverSocket.id;
    }
    useEffect(()=>{
        async function getLocationService(){
            const value = await AsyncStorage.getItem('@ServiceEnabled');
            const user = await AsyncStorage.getItem('@UserKey');
            const driver = await AsyncStorage.getItem('@DriverKey');
            const driverStatus = await AsyncStorage.getItem("@DriverStatus");
            if(value && user){
                if(value==='true'){
                    setService('true');
                    setUserKey(user);
                }
            }
            if(driver){
                setDriverKey(driver);
                if(driverStatus.includes("Approved")){
                    setDriverStatus("Approved");
                }
            }
        }
        getLocationService();
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: false,
              shouldSetBadge: false,
            }),
        });
        const subscription = Notifications.addNotificationResponseReceivedListener(response=>{
            if(_userData){
                props.navigation.navigate('Drive',{
                    ride:true,
                    user:{
                        UserDisplayName:_userData.name,
                        UserPhone:_userData.phone,
                        UserImage:_userData.photo,
                        Coordinates:{
                            longitude:_userLocation.longitude,
                            latitude:_userLocation.latitude
                        }
                    },
                    startRide:_accept
                });
            }
            else{
                Alert.alert('Failed To Open Notification','Cannot Open Notification!');
            }
        });
        return async() => {
            await AsyncStorage.setItem('@ServiceEnabled','false');
            // LocationService.removeListener(ServiceName);
            LocationService.stopLocationService();
            subscription.remove();
        }
    },[]);
    return(
        <View>
            <Text style={[CommonStyles.MainHeading,{paddingBottom:0,marginTop:'15%',marginBottom:0}]}>
                Manage Your Location Services
            </Text>
            <ImageBackground source={require('../../../../assets/location.png')} style={{width:'100%',height:'86%', alignSelf:'center'}} resizeMode="cover">
                <TouchableOpacity style={[CommonStyles.SaveButton,{width:'90%',position:'absolute',bottom:'12%'}]}>
                    <Text style={CommonStyles.SaveText} onPress={async()=>{
                        if(serviceEnabled==="true"){
                            await AsyncStorage.setItem('@ServiceEnabled','false');
                            setService('false');
                            LocationService.stopLocationService();
                            if(LocationEvent) LocationEvent.remove();
                        }
                        else{
                            if(!LocationService.checkLocationServices()){
                                LocationService.init();
                                LocationService.startLocationService();
                            }
                            if(driverKey){
                                if(driverStatus==="Approved"){
                                    connectDriverSocket();
                                }
                            }
                            await AsyncStorage.setItem('@ServiceEnabled','true');
                            setService('true');
                        }
                    }}>
                        {serviceEnabled==='true'?'Disable Location Services':'Enable Location Services'}
                    </Text>
                </TouchableOpacity>
            </ImageBackground>
        </View>
    )
}

export default EnableLocation;