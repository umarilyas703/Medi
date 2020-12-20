import React,{useEffect,useState} from 'react';
import { StyleSheet, Image, View, TouchableOpacity, Alert, Dimensions, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons, Octicons, MaterialIcons } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import { WebView } from 'react-native-webview';

import AsyncStorage from '@react-native-async-storage/async-storage';
import store from './src/redux/store';
import theme from './src/themes';
import firebaseApp from './firebase';
import HomeScreen from './src/screens/Home/Home';
import RequestScreen from './src/screens/Home/Requests/Request';
import DriverSignUp from './src/screens/Driver/DriverSignUp';
import SelectImages from './src/components/SelectImages';
import SignUp from './src/screens/LogIn/SignUp';
import LogIn from './src/screens/LogIn/LogIn';
import BeDonor from './src/screens/Donor/BeDonor';
import UserProfile from './src/screens/User/UserProfile';
import EnableLocation from './src/screens/Home/LocationTab/EnableLocation';
import NotificationSetting from './src/screens/Home/NotificationTab/NotificationScreen';
import DriverAccpet from './src/screens/Home/DriveScreen/DriveAccept';
import ConfigureCamera from './src/screens/Camera/ConfigureCamera';
import CameraStream from './src/screens/Camera/CameraStream';
import SOSMessage from './src/screens/User/SOSMessage';
import Services from './src/screens/User/Services';

// import Chat from './src/screens/Home/chat';
import LinkUser from './src/screens/Home/link';
import LinkUserC from './src/screens/Home/linkC';
import CommonStyles from './src/CommonStyles';

const BottomNavigation = createBottomTabNavigator();
const DrawerNavigation = createDrawerNavigator();
const HomeStack = createStackNavigator();
const RequestStack = createStackNavigator();
const AuthStack = createStackNavigator();
const LocationStack = createStackNavigator();
const NotificationStack = createStackNavigator();
const CameraStack = createStackNavigator();

global.ServerAPI = "http://192.168.10.19:3000/";
global.DjangoServer = "http://192.168.10.22:8000/";

global.calculateAge = function(birthDate){
  var ageDifMs = Date.now() - birthDate.getTime();
  var ageDate = new Date(ageDifMs); // miliseconds from epoch
  const age =  Math.abs(ageDate.getUTCFullYear() - 1970);
  return age;
}
const {width,height} = Dimensions.get('window');
function ShowWebView(props){
  console.log(props.route.params.source);
  const [uploading,setUploading] = useState(0);
  return(
    <WebView 
      source={{uri: props.route.params.source}} 
      cacheEnabled 
      renderLoading={()=>(
        <View style={{flex:1}}>
          <ActivityIndicator
            color={theme.secondary}
            size="large"
            style={{flex:0.6, justifyContent:'center'}}
          />
          <Text style={[CommonStyles.RestrictionText,{
            fontSize:19,
            fontWeight:'bold'
          }]}>Loading Page For {props.route.params.aid}{'\n'+uploading}% Completed...</Text>
        </View>
      )}
      onLoadProgress={(e)=>{
        setUploading(Math.round(e.nativeEvent.progress).toFixed()*100);
      }}
      style={{marginTop:20}}
      javaScriptEnabled
      startInLoadingState={true}  
    />
  );
}
function CommonStackOptions(props){
  return {
    headerTitle:"",
    headerStyle:{
      height:65,
    },
    headerTransparent:true,
    headerBackImage:(()=>(
      <MaterialCommunityIcons name="menu-open" color={theme.tabBar} size={25}/>
    )),
    headerLeft:(()=>(
      <TouchableOpacity style={{marginLeft:5}} onPress={()=>{
        const Drawer = props.navigation.dangerouslyGetParent();
        Drawer.toggleDrawer();
      }}>
        <MaterialCommunityIcons name="menu-open" color={theme.tabBar} size={40}/>
      </TouchableOpacity>
    )),
    headerRight:(()=>(
      <TouchableOpacity style={{marginRight:5}} onPress={()=>{
        props.navigation.navigate('UserProfile');
      }}>
        <MaterialIcons name="person-pin" color={theme.tabBar} size={40}/>
      </TouchableOpacity>
    ))
  }
}
const _HomeStack = (props) => {
  return(
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} options={CommonStackOptions(props)}/>
      <HomeStack.Screen name="WebView" component={ShowWebView} options={{headerShown:false}}/>
      <HomeStack.Screen name="DriverSignUp" component={DriverSignUp} options={CommonStackOptions(props)}/>
      <HomeStack.Screen name="BeDonor" component={BeDonor} options={CommonStackOptions(props)}/>
      <HomeStack.Screen name="Chat" component={LinkUser} options={CommonStackOptions(props)}/>
      <HomeStack.Screen name="SelectImages" component={SelectImages} options={CommonStackOptions(props)}/>
      <HomeStack.Screen name="Drive" component={DriverAccpet} options={CommonStackOptions(props)}/>
      <HomeStack.Screen name="UserProfile" component={UserProfile} options={{
        headerShown:false
      }}/>
      <HomeStack.Screen name="Services" component={Services} options={CommonStackOptions(props)}/>
      <HomeStack.Screen name="SOSMessage" component={SOSMessage} options={CommonStackOptions(props)}/>
      <HomeStack.Screen name="Camera" component={_CameraStack} options={CommonStackOptions(props)}/>
      <HomeStack.Screen name="CameraStream" component={CameraStream} options={CommonStackOptions(props)}/>
      
    </HomeStack.Navigator>
  );
}
const _RequestStack = (props) => {
  return(
    <RequestStack.Navigator>
      <RequestStack.Screen name="Request" component={RequestScreen} options={CommonStackOptions(props)}/>
      <RequestStack.Screen name="CustChat" component={LinkUserC} options={CommonStackOptions(props)}/>
      <RequestStack.Screen name="Drive" component={DriverAccpet} options={CommonStackOptions(props)}/>
      <RequestStack.Screen name="CameraStream" component={CameraStream} options={CommonStackOptions(props)}/>
    </RequestStack.Navigator>
  )
}
const _NotificationStack = (props) => {
  return(
    <NotificationStack.Navigator>
      <NotificationStack.Screen name="Notification" component={NotificationSetting} options={CommonStackOptions}/>
      <NotificationStack.Screen name="Drive" component={DriverAccpet} options={CommonStackOptions(props)}/>
      <NotificationStack.Screen name="CameraStream" component={CameraStream} options={CommonStackOptions(props)}/>
    </NotificationStack.Navigator>
  )
}
const _LocationStack = (props) => {
  return(
    <LocationStack.Navigator>
      <LocationStack.Screen name="Location" component={EnableLocation} options={CommonStackOptions}/>
      <LocationStack.Screen name="Drive" component={DriverAccpet} options={CommonStackOptions(props)}/>
      <LocationStack.Screen name="CameraStream" component={CameraStream} options={CommonStackOptions(props)}/>
    </LocationStack.Navigator>
  )
}
const _BottomTabs = (props) => {
  return(
    <BottomNavigation.Navigator tabBarOptions={{
      activeTintColor:theme.secondary,
      inactiveTintColor:theme.white,
      labelStyle:{
        fontSize:12,
        fontWeight:'bold'
      },
      style:{
        borderTopLeftRadius:90,
        borderTopRightRadius:90,
        borderBottomLeftRadius:10,
        borderBottomRightRadius:10,
        borderBottomEndRadius:10,
        marginBottom:1,
        backgroundColor:theme.tabBar
      },
      labelPosition:'below-icon',
      showLabel:false,
      keyboardHidesTabBar:true
    }}
    >
      <BottomNavigation.Screen name="TabMain" component={_HomeStack} options={{
        tabBarLabel:"HOME",
        tabBarIcon:({color})=>(
          <MaterialCommunityIcons name="home" color={color} size={20}/>
        )
      }}
      />
      <BottomNavigation.Screen name="TabAmulance" component={_RequestStack} options={{
        tabBarLabel:"HOME",
        tabBarIcon:({color})=>(
          <View style={{padding:3}}>
            <Octicons name="issue-opened" color={color} size={30}/>
          </View>
        )
      }}
      />
      <BottomNavigation.Screen name="TabNotifications" component={_NotificationStack} options={{
        tabBarLabel:"HOME",
        tabBarIcon:({color})=>(
          <View style={{padding:3}}>
            <MaterialCommunityIcons name="bell" color={color} size={20}/>
          </View>
        )
      }}
      />
      <BottomNavigation.Screen name="TabLocationn" component={_LocationStack} options={{
        tabBarLabel:"HOME",
        tabBarIcon:({color})=>(
          <View style={{padding:3}}>
            <Octicons name="location" color={color} size={20}/>
          </View>
        )
      }}
      />
    </BottomNavigation.Navigator>
  );
}
const _CameraStack = (props) => {
  return(
    <CameraStack.Navigator>
      <CameraStack.Screen name="ConfigureCamera" component={ConfigureCamera} options={CommonStackOptions}/>
      <CameraStack.Screen name="Stream" component={CameraStream} options={CommonStackOptions}/>
    </CameraStack.Navigator>
  )
}
async function ResetKeys(){
  await AsyncStorage.clear();
  Alert.alert('All Keys Reset','All Keys are cleared!');
  return(
    <View>

    </View>
  );
}
const MainDrawer = (props) => {
  return(
    <DrawerNavigation.Navigator>
      <DrawerNavigation.Screen name="HOME" component={_BottomTabs}/>
      <DrawerNavigation.Screen name="ResetKeys" component={ResetKeys}/>
      <DrawerNavigation.Screen name="Camera" component={_CameraStack} />
    </DrawerNavigation.Navigator>    
  );
}
const App = () => {
  const [directLogin,setDirectLogin] = useState(false);
  const [isLoading,setIsLoading] = useState(true);

  firebaseApp.initalize();
  useEffect(() => {
    async function checkUser(){
      const value = await AsyncStorage.getItem('@UserKey');
      const value2 = await AsyncStorage.getItem('@UserEmail');
      if(value && value2){
        setDirectLogin(true);
        setIsLoading(false);
      }
      else{
        setDirectLogin(false);
        setIsLoading(false);
      }
    }
    checkUser();    
  }, [])
  
  return (
    <Provider store={store}>
      {isLoading?(
        <View>
          <Image source={require('./assets/splash.png')} style={{width:width,height:height}} resizeMode="contain"/>
        </View>
      ):(
        <NavigationContainer>
          <AuthStack.Navigator>
            {
              directLogin==false&&(
                <>
                  <AuthStack.Screen name="SignIn" component={LogIn} options={{headerShown:false}}/>
                  <AuthStack.Screen name="SignUp" component={SignUp} options={{headerShown:false}}/>
                </>
              )
            }
            <AuthStack.Screen name="HOME" component={MainDrawer} options={{headerShown:false}}/>
            <AuthStack.Screen name="SelectImages" component={SelectImages} options={{headerShown:false}}/>
          </AuthStack.Navigator>
        </NavigationContainer>
      )}
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
