import React,{useState, useEffect} from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator, FlatList } from 'react-native';
import theme from '../../themes';
import Contribute from './MainTabs/Contribute';
import FirstAid from './MainTabs/FirstAid';
import Donations from './MainTabs/Donations';
import FirebaseFunctions from '../../FirebaseFunctions';
import { StatusBar } from 'expo-status-bar';
import { LocationService } from '../../components/Services/LocationService';
// Experimental Code
import io from 'socket.io-client';
import firebase from 'firebase';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = (props) => {
    let socket = null;
    const {width,height} = Dimensions.get('screen');
    const [activeNow,setActiveNow] = useState("FirstAid");
    const [allStatus,setAllStatus] = useState([]);
    const [firstAids,setFirstAids] = useState([]);
    const [runStatusEffect,setRunStatusEffect] = useState(true);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [status, setStatus] = useState("");
    const [donorStatus, setDonorStatus] = useState("0");
    const [UserKey,setUserKey] = useState("");
    const [dataC,setDataC] = useState([]);
    
    useEffect(()=>{
        async function AllStatus(){
            if(runStatusEffect){
                const driverStatus = FirebaseFunctions.getDriverStatus();
                const donorStatus = FirebaseFunctions.getDonorStatus();
                Promise.all([driverStatus,donorStatus]).then(allStatus=>{
                    setDonorStatus(allStatus[1]);
                    setAllStatus(allStatus);
                    setRunStatusEffect(false);
                }).catch(err=>{
                    Alert.alert('Unexpected Error Occured!','Cannot Fetch Contributions Status \n\n'+err);
                })
            }
        }
        async function fetchFirstAid(){
            if(runStatusEffect){
                const firstAids = await FirebaseFunctions.fetchFirstAids();
                setFirstAids(firstAids);
            }
        }
        async function getUserKey(){
            const UserKey = await AsyncStorage.getItem('@UserKey');
            if(UserKey){
                setUserKey(UserKey);
            }
        }
        async function setFireNotifications(){
            const fire = await AsyncStorage.getItem('@fireNotifications');
            if(fire==='true'){
                FirebaseFunctions.setUpNotification(UserKey,props);
            }
        }
        fetchFirstAid();
        AllStatus();
        getUserKey();
        setFireNotifications();

        // async function getRequests(){
        //     var data = [];
        // try{
        //    await firebase.database().ref('/BloodDonation/').once('value').then(function(snapshot) {
        //       snapshot.forEach(function(childsnapshot) {
        //         let customer = {
        //           id: childsnapshot.val()
        //         };
        //         console.log("HEY",customer);
        //         data.push(customer);
        //       });
        //     });
        //     setDataC(data);
        //   }
        //   catch{console.log("NOthing")}
        // }
        // getRequests();


    },[runStatusEffect]);

    useEffect(() => {
        if(allStatus[1] == "0"){

            try{
                firebase.database().ref('/BloodDonation/').child(uid).on('value', (snapshot) => {
                     console.log("HERRSDS", snapshot.child("Status").val())
                         setStatus(snapshot.child("Status").val())
                     console.log(status)
                 }).then(console.log(status));

                 if(status == "Active"){
                     () => props.navigation.navigate("CustChat")
                 }
             }
                catch{
                    console.log("no Requests")
                }
        }
    },[status])

    function activeStyles(component){
        if(component===activeNow){
            return styles.activeService
        }
        else{
            return styles.inactiveService
        }
    }


    async function handleAccept(dta){
        var cusID= dta.CusID;
        var blood= dta.bloodgroup;
        var cusName= dta.CusName;
        var day = dta.day;

        try{
            let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      console.log(location.coords.latitude)
        }
        catch{
            console.log("location not granted")
        }

       try{
        var uid = firebase.auth().currentUser.uid;
        var nme = firebase.auth().currentUser.displayName;

                firebase
                .database()
                .ref('/BloodDonation/').child(uid)
                .update({
                    DonorID: uid,
                    DonorName: nme,
                    DLatitude: latitude,
                    DLongitude: longitude,
                    Status: "Active"
                })
                .then(() => {
                    console.log('Succesfully created');
                    // props.navigation.navigate("Chat");
                })
                .catch((e)=>console.log('Add item failed. Please check your internet connection'));
            }
            catch{
                console.log("Errrorrr")
            }

            try{
                var duid = firebase.auth().currentUser.uid;

                firebase
                .database()
                .ref('/CustomerID/').child(duid)
                .set({
                    ID: cusID,
                    Name: cusName,
                })
                .then(() => {
                    console.log('Succesfully created');
                    props.navigation.navigate("Chat");
                })
                .catch((e)=>console.log('Add item failed. Please check your internet connection'));
            }
            catch{
                console.log("Errrorrr")
            }
    }

    return(
        <View style={{flex:1}}>
            <StatusBar backgroundColor='#f5f7fa' style="dark"/>
            <View>
                <Text style={[styles.Heading,{paddingBottom:0,marginTop:25}]}>Always Ready</Text>
                <Text style={[styles.Heading,{paddingTop:0}]}>anytime {'&'} anywhere!</Text>

                <Text style={[styles.Heading,{fontSize:20,paddingTop:0,paddingBottom:5}]}>Services By Category</Text>
                <ScrollView horizontal contentContainerStyle={{
                    paddingLeft:20
                }}
                showsHorizontalScrollIndicator={false}
                >
                    <TouchableOpacity style={{width:width*0.40,margin:5}} onPress={()=>setActiveNow("FirstAid")}>
                        <Text style={activeStyles("FirstAid")}>First Aid</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{width:width*0.40,margin:5}} onPress={()=>setActiveNow("Donations")}>
                        <Text style={activeStyles("Donations")}>Donate Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{width:width*0.40,margin:5}} onPress={()=>setActiveNow("Health")}>
                        <Text style={activeStyles("Health")}>Health</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{width:width*0.40,margin:5}} onPress={()=>setActiveNow("Contribute")}>
                        <Text style={activeStyles("Contribute")}>Contribute</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
            <ScrollView>
                {(activeNow==="Contribute"&&(
                    <>
                    {allStatus.length>0?(
                        <Contribute props={props} allStatus={allStatus} runStatusEffect={setRunStatusEffect}/>
                    ):(
                        <View>
                            <ActivityIndicator 
                                size={50}
                                color={theme.secondary}
                                style={{alignSelf:'center',marginTop:'30%'}}
                            />
                            <Text style={[styles.Heading,{fontSize:22, textAlign: 'center'}]}>Fetching Data{'\n'}Please Wait...</Text>
                        </View>
                    )}
                    </>
                ))}
                {activeNow==="Not Visible"&&(
                    <TouchableOpacity onPress={()=>{
                        // const API = global.ServerAPI;
                        // socket = io.connect(API);
                
                        // socket.on('connection-success',data=>{
                        //     console.log(data);
                        //     console.log('Client is now connected with server');
                        // });
                
                        // socket.on('disconnect',data=>{
                        //     console.log(data);
                        //     console.log('Client is now disconnected with server');
                        // });                        
                        LocationService.getCurrentLocation().then(location=>{
                            console.log(location);
                        });
                        console.log('Location Serivce Running: '+LocationService.running);
                    }}>

                        {allStatus[1]!="0"&&(
                            <View>
                        <Text>Requests</Text>

                        <FlatList
                            data={dataC}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item, index}) => (
                            <View style={styles.TextInputbox}>
                                <Text style={{fontSize: 16}}>
                                {item.id.name + "   " + item.id.bloodgroup}
                                </Text>
                                <TouchableOpacity style={{marginLeft:'10%', borderColor:'black', backgroundColor:'green', padding:'3%'}} onPress={() => handleAccept(item.id)}>
                                <Text>Accept</Text>
                            </TouchableOpacity>
                            </View>
                            )}
                        />
                        </View>
                        )}

                        <Text style={{
                            fontSize:18,
                            fontWeight:'bold',
                            textAlign:'center',
                            backgroundColor:theme.secondary,
                            color:'white',
                            padding:20,
                            borderRadius:20,
                            margin:10,
                            marginTop:'85%'
                        }}>{"Print My Location"}</Text>
                    </TouchableOpacity>
                )}
                {activeNow==="FirstAid"&&(
                    <>
                    {firstAids.length>0?(
                        <FirstAid props={props} firstAids={firstAids} runStatusEffect={setRunStatusEffect}/>
                    ):(
                        <View>
                            <ActivityIndicator 
                                size={50}
                                color={theme.secondary}
                                style={{alignSelf:'center',marginTop:'30%'}}
                            />
                            <Text style={[styles.Heading,{fontSize:22, textAlign: 'center'}]}>Fetching Data{'\n'}Please Wait...</Text>
                        </View>
                    )}
                    </>
                )}         
            </ScrollView>
            {activeNow==="Donations"&&(
                <Donations UserKey={UserKey} IsDonor={donorStatus.includes("Approved")?true:false}/>
            )}
            <View style={{marginBottom:10}}>
            </View>   
        </View>
    );
}

const styles = StyleSheet.create({
    Heading:{
        fontSize:35,
        fontWeight:'bold',
        padding:30,
        color:theme.tabBar
    },
    activeService:{
        backgroundColor:theme.secondary,
        color:theme.white,
        fontWeight:'bold',
        fontSize:20,
        textAlign:'center',
        borderRadius:30,
        padding:10,
    },
    inactiveService:{
        backgroundColor:theme.white,
        color:theme.tabBar,
        fontWeight:'bold',
        fontSize:20,
        textAlign:'center',
        borderRadius:30,
        padding:10,
        borderWidth:0.2
    },
    TextInputbox: {
        // paddingTop: 13,
        // paddingHorizontal: 16,
        width: '90%',
        height: 58,
        flexDirection: 'row',
        marginVertical: 10,
        borderColor: 'black',
        backgroundColor: 'white',
        borderWidth: 0,
    
        // elevation: 2,
        shadowColor: 'darkgrey',
        shadowOpacity: 1,
        elevation: 2,
        borderRadius: 5,
        fontSize: 6,
        fontFamily: 'Roboto-Bold',
        // height: 50,
        justifyContent: 'center',
        alignItems: 'center',
      },
}); 
export default HomeScreen;