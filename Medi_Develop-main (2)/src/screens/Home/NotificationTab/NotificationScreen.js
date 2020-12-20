import React,{useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import themes from '../../../themes';
import CommonStyles from '../../../CommonStyles';
import {StatusBar} from 'expo-status-bar'
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FirebaseFunctions from '../../../FirebaseFunctions';

const NotificationSetting = (props) =>{
    const [ambulanceNotification, setambulanceNotifications] = useState(false);
    const [bloodNotification, setBloodNotifications] = useState(false);
    const [driverNotification, setDriverNotifications] = useState(false);
    const [fireNotification,setFireNotifications] = useState(false);
    const [userKey,setUserKey] = useState("");

    useEffect(()=>{
        async function getNotificationSettings(){
            const ambulance = await AsyncStorage.getItem('@ambulanceNotifications');
            const blood = await AsyncStorage.getItem('@bloodNotifications');
            const driver = await AsyncStorage.getItem('@driverNotifications');
            const fire = await AsyncStorage.getItem('@fireNotifications');
            const user = await AsyncStorage.getItem('@UserKey');

            if(ambulance) setambulanceNotifications(ambulance==="true"?true:false);
            if(blood) setBloodNotifications(blood==="true"?true:false);
            if(driver) setDriverNotifications(driver==="true"?true:false);
            if(fire) setFireNotifications(fire==="true"?true:false); 
            if(user) setUserKey(user);
        }
        getNotificationSettings();
    },[]);

    return(
        <View style={{flex:1}}>
            <StatusBar backgroundColor='#f5f7fa' style="dark"/>
            <Text style={[CommonStyles.MainHeading,{marginTop:50}]}>Manage Your Notifications Here</Text>

            <View style={styles.Container}>
                <View style={{flex:0.1}}>
                    <FontAwesome5 name="ambulance" size={25} color={ambulanceNotification?themes.secondary:themes.tabBar}/>
                </View>
                <View style={{flex:0.8}}>
                    <Text style={styles.Text}>Ambulance Notifications</Text>
                </View>
                <View style={{flex:0.1}}>
                    <Switch 
                        trackColor={{ false: themes.tabBar, true: themes.secondary }}
                        thumbColor={ambulanceNotification ? "#fdfdfd" : "#fdfdfd"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={async ()=>{
                            if(ambulanceNotification){
                                setambulanceNotifications(false);
                                await AsyncStorage.setItem('@ambulanceNotifications', 'false');
                            }
                            else{
                                setambulanceNotifications(true);
                                await AsyncStorage.setItem('@ambulanceNotifications', 'true');
                            }
                        }}
                        style={{width:'100%'}}
                        value={ambulanceNotification}
                    />
                </View>
            </View>

            <View style={styles.Container}>
                <View style={{flex:0.1}}>
                    <MaterialCommunityIcons name="blood-bag" size={30} color={bloodNotification?themes.secondary:themes.tabBar}/>
                </View>
                <View style={{flex:1}}>
                    <Text style={styles.Text}>Blood Notifications     </Text>
                </View>
                <View style={{flex:0.1}}>
                    <Switch 
                        trackColor={{ false: themes.tabBar, true: themes.secondary }}
                        thumbColor={bloodNotification ? "#fdfdfd" : "#fdfdfd"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={async ()=>{
                            if(bloodNotification){
                                setBloodNotifications(false);
                                await AsyncStorage.setItem('@bloodNotifications', 'false');
                            }
                            else{
                                setBloodNotifications(true);
                                await AsyncStorage.setItem('@bloodNotifications', 'true');
                            }
                        }}
                        style={{width:'100%'}}
                        value={bloodNotification}
                    />
                </View>
            </View>

            <View style={styles.Container}>
                <View style={{flex:0.2}}>
                    <FontAwesome5 name="car" size={30} color={driverNotification?themes.secondary:themes.tabBar}/>
                </View>
                <View style={{flex:1}}>
                    <Text style={styles.Text}>Driver Notifications         </Text>
                </View>
                <View style={{flex:0.1}}>
                    <Switch 
                        trackColor={{ false: themes.tabBar, true: themes.secondary }}
                        thumbColor={driverNotification ? "#fdfdfd" : "#fdfdfd"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={async ()=>{
                            if(driverNotification){
                                setDriverNotifications(false);
                                await AsyncStorage.setItem('@driverNotifications', 'false');
                            }
                            else{
                                setDriverNotifications(true);
                                await AsyncStorage.setItem('@driverNotifications', 'true');
                            }
                        }}
                        style={{width:'100%'}}
                        value={driverNotification}
                    />
                </View>
            </View>

            <View style={styles.Container}>
                <View style={{flex:0.2}}>
                    <MaterialCommunityIcons name="fire-truck" size={30} color={fireNotification?themes.secondary:themes.tabBar}/>
                </View>
                <View style={{flex:1}}>
                    <Text style={styles.Text}>Fire Service Notifications         </Text>
                </View>
                <View style={{flex:0.1}}>
                    <Switch 
                        trackColor={{ false: themes.tabBar, true: themes.secondary }}
                        thumbColor={fireNotification ? "#fdfdfd" : "#fdfdfd"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={async ()=>{
                            if(fireNotification){
                                setFireNotifications(false);
                                await AsyncStorage.setItem('@fireNotifications', 'false');
                            }
                            else{
                                setFireNotifications(true);
                                await AsyncStorage.setItem('@fireNotifications', 'true');
                                FirebaseFunctions.setUpNotification(userKey,props);
                            }
                        }}
                        style={{width:'100%'}}
                        value={fireNotification}
                    />
                </View>
            </View>

        </View>
    )
}
const styles = StyleSheet.create({
    Image:{
        width:'100%', height:'95%', 
    },  
    Container:{
        padding:10,flexDirection:'row',margin:10,marginBottom:0,backgroundColor:'white',shadowColor:'black',shadowOpacity:1,elevation:5,borderRadius:10,height:50
    },
    Text:{
        flex:0.8,fontSize:17,fontWeight:'bold',textAlignVertical:'center',color:themes.tabBar,textAlign:'center'
    }    
});
export default NotificationSetting;