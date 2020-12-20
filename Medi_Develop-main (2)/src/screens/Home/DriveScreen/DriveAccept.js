import React,{useState, useEffect, useRef} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    Alert,
    Linking
} from 'react-native';
import theme from '../../../themes';
import CommonStyles from '../../../CommonStyles';
import CommonFunctions from '../Requests/CommonFunctions';
import LocationService from '../../../components/Services/Location';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import mapStyles from '../../../../mapStyles';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { Stopwatch, Timer } from 'react-native-stopwatch-timer'

// {
//     UserDisplayName:"Hassan nasir",
//     UserPhone:"0304 9410800",
//     UserImage:"https://image.shutterstock.com/image-vector/person-icon-260nw-282598823.jpg",
//     Coordinates:{
//         longitude:73.365066,
//         latitude:33.5948587
//     }
// }
let _time = "00:00:00";

const DriverAccpet = (props) => {
    console.log(props);
    const [ride] = useState(props.route.params.ride || false);
    const [user] = useState(props.route.params.user);
    const [showMaps,setShowMaps] = useState(false);
    const modalRef = useRef(null);
    const [stopWatchStart,setStopWatachStart] = useState(false);
    const [timeRide,setTimeRide] = useState(0);

    const myLocation = function(){
        const Location = LocationService.getCurrentLocation();
        return {
            latitude:Location.coords.latitude,
            longitude:Location.coords.longitude
        }
    };
    const distance = function(){
        const location = myLocation();
        const dist = CommonFunctions.getDistance(
            user.Coordinates.latitude,
            user.Coordinates.longitude,
            location.latitude,
            location.longitude
        );
        return dist;
    };
    const startRide = props.route.params.startRide;
    return(
        <View>
            <StatusBar backgroundColor={theme.tabBar} style="light" animated/>
            <Modal 
                visible={showMaps}
                onDismiss={()=>setShowMaps(false)}
                onRequestClose={()=>setShowMaps(false)}
                transparent
                ref={modalRef}
            >
                <View style={{backgroundColor:'rgba(0,0,0,0.9)',flex:1}}>
                    <View style={{height:'80%',width:'95%',alignSelf:'center',borderRadius:20,marginTop:'10%'}}>
                        <MapView
                            style={{width:'100%',height:'80%',zIndex:1,borderRadius:40,alignSelf:'center'}}
                            initialRegion={{
                                latitude:myLocation().latitude,
                                longitude:myLocation().longitude
                            }}
                            provider="google"
                            maxZoomLevel={20}
                            minZoomLevel={17}
                            customMapStyle={mapStyles}
                            region={{
                                latitude:myLocation().latitude,
                                longitude:myLocation().longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                            rotateEnabled
                        >
                            <Marker 
                                coordinate={{
                                    latitude:user.Coordinates.latitude,
                                    longitude:user.Coordinates.longitude
                                }}
                                draggable={false}
                                pinColor="#9933CC"
                            />
                            <Marker
                                coordinate={{
                                    latitude:myLocation().latitude,
                                    longitude:myLocation().longitude
                                }}
                                draggable={false}
                                // pinColor="#9933CC"
                                image={require('../../../../assets/car.png')}
                            />
                        </MapView>
                        <View style={{height:'20%',alignSelf:'center',width:'100%'}}>
                            <View style={{flexDirection:'row',width:'100%'}}>
                                    <TouchableOpacity style={[CommonStyles.SaveButtonSmall,{width:'48%'}]} onPress={()=>{
                                        if(_time==="00:00:00"){
                                            setShowMaps(false);
                                        }
                                        else{
                                            var hms = _time;
                                            if(hms!="00:00:00"){
                                                var a = hms.split(':'); // split it at the colons
                                                // Hours are worth 60 minutes.
                                                var minutes = (+a[0]) * 60 + (+a[1]);
                                                setStopWatachStart(false);
                                                Alert.alert('Ride Ended', 'Please take Rs '+(minutes*13));
                                                setShowMaps(false);
                                            }   // your input string
                                        }
                                    }}>
                                        <Text style={CommonStyles.SaveTextSmall}>END Ride</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[CommonStyles.SaveButtonSmall,{width:'43%'}]}
                                        onPress={()=>{
                                            Linking.openURL(`tel:${user.phone}`)
                                        }}
                                    >
                                        <Text style={CommonStyles.SaveTextSmall}>Call Requestee</Text>
                                    </TouchableOpacity>
                            </View>
                            <View>
                                {stopWatchStart==false&&(
                                        <TouchableOpacity style={[CommonStyles.SaveButton,{width:'95%',alignSelf:'center'}]}
                                            onPress={()=>{
                                                setStopWatachStart(true);
                                            }}
                                        >
                                            <Text style={CommonStyles.SaveText}>Start Ride</Text>
                                        </TouchableOpacity>
                                )}
                            </View>
                            <View>
                            {stopWatchStart&&(
                                <Stopwatch 
                                    start={stopWatchStart}
                                    reset={()=>setStopWatachStart(false)}
                                    // options={options}
                                    getTime={(time)=>{
                                        _time = time;
                                    }}
                                />
                        )}
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            {ride===true?(
                <>
                    <View style={styles.Upper}> 
                        <View style={{flexDirection:'row',width:'100%'}}>
                            <TouchableOpacity style={{
                                    flex:0.2,
                                    borderColor:theme.tabBar,
                                    borderWidth:0.2,
                                    borderRadius:5,
                                    marginRight:5
                                }}
                                onPress={()=>{
                                    props.navigation.goBack();
                                    // console.log(props.navigation);
                                }}
                                >
                                    <MaterialIcons name="arrow-back" size={40} color="white" style={{alignSelf:'center',width:'100%',marginTop:'65%',paddingLeft:20}}/>
                            </TouchableOpacity>
                            <View style={{flex:0.8}}>
                                <Text style={[CommonStyles.MainHeading,styles.FontProfile]}>New Ride Request</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.Lower}>
                        <Image source={{uri:user.UserImage}} style={styles.ImageStyle} resizeMode="stretch"/>
                        <Text style={styles.Name}>{user.UserDisplayName}</Text>
                        <Text style={styles.Email}>{user.UserPhone}</Text>
                    </View>
                    <View style={{borderRadius:10,padding:1,height:'45%',marginTop:10,width:'95%',alignSelf:'center',elevation:5}}>
                    {user.Coordinates.longitude&&(
                        <MapView 
                            style={{width:'99%',height:'100%',zIndex:1,borderRadius:40,alignSelf:'center'}}
                            provider="google"
                            maxZoomLevel={20}
                            minZoomLevel={15}
                            customMapStyle={mapStyles}
                            initialRegion={{
                                latitude:user.Coordinates.latitude,
                                longitude:user.Coordinates.longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                            rotateEnabled
                            showsMyLocationButton
                            showsUserLocation
                        >
                            <MapView.Marker
                                coordinate={{
                                    latitude: user.Coordinates.latitude,
                                    longitude: user.Coordinates.longitude
                                }}
                                title={user.UserDisplayName}
                                description={distance()+""}
                            />
                        </MapView>
                    )}
                    </View>
                    <View style={{flexDirection:'row',marginTop:'3%',width:'90%',alignSelf:'center'}}>
                        <TouchableOpacity style={{
                            flex:0.5,
                            borderColor:theme.secondary,
                            borderWidth:0.2,
                            marginRight:5
                        }}
                        onPress={()=>{
                            startRide();
                            setShowMaps(true);
                        }}
                        >
                            <Text style={{
                                backgroundColor:'white',
                                textAlign:'center',
                                fontWeight:'bold',
                                borderRadius:20,
                                padding:10,
                                fontSize:16,
                                borderColor:theme.secondary,
                                borderWidth:1.5,
                                color:theme.secondary,
                                shadowOpacity:1,
                                elevation:3
                            }}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{
                            flex:0.5,
                            borderColor:theme.tabBar,
                            borderWidth:0.2,
                            marginRight:5
                        }}
                        onPress={()=>{
                            props.navigation.goBack();
                        }}
                        >
                            <Text style={{
                                backgroundColor:'white',
                                textAlign:'center',
                                fontWeight:'bold',
                                borderRadius:20,
                                padding:10,
                                borderRadius:20,
                                fontSize:16,
                                borderColor:theme.tabBar,
                                borderWidth:1.5,
                                color:theme.tabBar,
                                shadowOpacity:1,
                                elevation:3
                            }}>
                                Go Back
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                </>
            ):(
                <>
                    {/* <MapView 
                        // ref={mapRef}
                        style={{width:'50%',height:'50%',zIndex:1}}
                        provider="google"
                        maxZoomLevel={20}
                        minZoomLevel={17}
                        customMapStyle={mapStyles}
                        initialRegion={{
                            latitude:user.Coordinates.latitude,
                            longitude:user.Coordinates.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                        rotateEnabled
                    >
                        <MapView.Marker
                            coordinate={{
                                latitude: user.Coordinates.latitude,
                                longitude: user.Coordinates.longitude
                            }}
                            title={user.UserDisplayName}
                            description={user.UserPhone}
                        />
                    </MapView> */}
                </>
            )}
        </View>
    )
}
const styles = StyleSheet.create({
    Upper: { 
        height: 200, 
        backgroundColor: theme.tabBar, 
        flexDirection: 'row',
        borderBottomLeftRadius:30,
        borderBottomRightRadius:30
    },
    FontProfile:{
        color: theme.white,
        marginTop: '16%',
        fontSize: 30,
        paddingLeft: 10
    },
    ImageStyle:{
        height: 150,
        width: 130,
        borderRadius: 50,
        alignSelf: 'center',
        marginTop:'-15%'
    },
    Lower:{
        borderRadius: 30,
        width: '90%',
        alignSelf: 'center',
        marginTop: '-5%',
        backgroundColor:'white'
    },
    Name:{
        textAlign:'center',
        fontSize:19,
        fontWeight:'bold',
        color:theme.tabBar
    },
    Email:{
        textAlign:'center',
        fontSize:16,
        fontWeight:'bold',
        color:theme.greyOutline
    },
    Container:{
        flexDirection:'row',margin:1
    },
    icon:{
        flex:0.2,padding:10,alignSelf:'center',textAlignVertical:'center'
    },
    Text:{
        flex:0.8,fontSize:18,fontWeight:'bold',textAlignVertical:'center',color:theme.tabBar
    }
})
export default DriverAccpet;