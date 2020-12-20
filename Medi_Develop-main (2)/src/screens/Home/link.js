import React, { Component, useEffect, useState } from "react";
import { AppRegistry, StyleSheet, Dimensions, Image, View, StatusBar, TouchableOpacity, Text, PermissionsAndroid, Modal, SafeAreaView, KeyboardAvoidingView, ScrollView, ActivityIndicator, Linking } from "react-native";
import MapView from 'react-native-maps';
// import Polyline from '@mapbox/polyline';
import MIcon from 'react-native-vector-icons/MaterialIcons'
import firebase from "firebase"
import PubNub from "pubnub";
import { PubNubProvider, usePubNub } from "pubnub-react"
import { Button ,TextInput} from 'react-native-paper';
// import '@react-native-firebase/auth'
// import '@react-native-firebase/database'
// import Geolocation from '@react-native-community/geolocation';
import FontAwesome from 'react-native-vector-icons/FontAwesome5'


const pubnub = new PubNub({
  subscribeKey: "sub-c-44dc460e-6f61-11ea-bbe3-3ec3e5ef3302",
  publishKey: "pub-c-6dbdc9ba-d87d-4e15-813c-1e6a76fe12bd"
});


function LinkUser(props) {
  
  const [latitude, setLatitude] = useState(33.56425081)
  const [longitude, setLongitude] = useState(73.12568990766728)
  const [error, setError] = useState(null)
  const [concat, setConcat] = useState(null)
  const [cordLatitude, setCordLatitude] = useState(33.720000)
  const [cordLongitude, setCordLongitude] = useState(73.060000)
  const [x, setX] = useState('false')
  const [coords, setCoords] = useState([])
  const [show, setShow] = useState(false)
  const [showu, setShowu] = useState(false)
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [picked, setPicked] = useState("false")
  const [status, setStatus] = useState("Not")
  const [rider, setRider] = useState('')
  const [rphone, setRphone] = useState('')
  const [chat, setChat] = useState('');


  useEffect(() => {
    var cuid;
      try{
          var uid = firebase.auth().currentUser.uid;

          firebase
          .database()
          .ref('/CustomerID/').child(uid)
          on('value', (snapshot) => {
              cuid = snapshot.child("ID").val()
          })
          .then(() => {
              console.log('Succesfully created');
              // props.navigation.navigate("Chat");
              getCustomer();
          })
          .catch((e)=>console.log('Add item failed. Please check your internet connection'));
      }
      catch{
          console.log("Errrorrr")
      }
    setChat(cuid);
    console.log('done')
    


    function getCustomer(){
      try{
        firebase.database().ref('/BloodDonation/').child(cuid).once('value', (snapshot) => {
           console.log("HERRSDS", snapshot.child("Latitude").val())
               setLatitude(parseFloat(snapshot.child("Latitude").val()))
               setLongitude(parseFloat(snapshot.child("Longitude").val()))
           console.log("pickup", latitude)
       }).then(getRider());
   }
      catch{
          console.log("error getting customer")
      }
   }


  pubnub.setUUID('Donor')

  const listener = {
    message: envelope => {
      setMessages(msgs => [
        ...msgs,
        {
          id: envelope.message.id,
          author: envelope.publisher,
          content: envelope.message.content,
          timetoken: envelope.timetoken
        }
      ]);
    }
  };

  pubnub.addListener(listener);
  pubnub.subscribe({ channels: [chat] });

  

  return function cleanup(){
    // Geolocation.clearWatch(watchID);
    pubnub.removeListener(listener);
    pubnub.unsubscribeAll();
   }

   function getRider(){
    try{
        firebase.database().ref('/BloodDonation/').child(cuid).on('value', (snapshot) => {
             console.log("HERRSDS", snapshot.child("DLatitude").val())
                 setCordLatitude(parseFloat(snapshot.child("DLatitude").val()))
                 setCordLongitude(parseFloat(snapshot.child("DLongitude").val()))
             console.log("donor", cordLatitude)
         }).then(mergeLot());
     }
        catch{
            console.log("error getting rider")
        }
  }

  function mergeLot(){
    if (latitude != null && longitude!=null)
     {
      let concatLot = latitude +","+longitude
      let concatLotCoord = cordLatitude +","+ cordLongitude
      setConcat(concatLot)
      getDirections(concatLot, concatLotCoord, "AIzaSyD-2KnDs0lN_0Z293JcYo9pDFF280_819k");
     }

   }

   async function getDirections(startLoc, destinationLoc, API) {
    try {  
      let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${ startLoc }&destination=${ destinationLoc }&key=${ API }`)
        let respJson = await resp.json();
        console.log(respJson)
        let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
        let coords = points.map((point, index) => {
            return  {
                latitude : point[0],
                longitude : point[1]
            }
        })
        setCoords(coords)
        setX("true")
        return coords
    } catch(error) {
      console.log('Error', error)
        setError("error")
        return error
    }
}

  },[cordLatitude, cordLongitude, pubnub, status])

  const handleSubmit = () => {
    // Clear the input field.
    setInput("");
    // Create the message with random `id`.
    const message = {
      content: input,
      id: Math.random()
        .toString(16)
        .substr(2)
    };
    // Publish our message to the channel `chat`
    pubnub.publish({ channel: chat, message });
  };

  const makeCall = () => {
    let phoneNumber = rphone;
    if (Platform.OS === 'android') {
      phoneNumber = `tel:${rphone}`;
    } else {
      phoneNumber = `telprompt:${rphone}`;
    }
    Linking.openURL(phoneNumber);
  };

//   function RiderData() {
//     var uid = firebase.auth().currentUser.uid;
//     mydb = firebase.database().ref('/PicknDrop/').child(uid);
//     mydb.once('value')
//     .then(function(snapshot) {
//       setRider(snapshot.child("Rider").val())
//       setRphone(snapshot.child("Rphone").val())
//       setShowu(true)
//     });
//   }

// if(status == "Active"){
    return (
        <View style={{flex:1, flexDirection:'row'}}>
          <Modal animationType='fade' transparent={true} visible={show}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                        <View style={{ backgroundColor: 'white', width:'90%', height:'80%', flexDirection:'row'}}>
                        <SafeAreaView style={styles.outerContainer}>
     <KeyboardAvoidingView
       style={styles.innerContainer}
       behavior="height"
       keyboardVerticalOffset={Platform.select({
         ios: 78,
         android: 0
       })}
     >
       <ScrollView style={styles.topContainer}>
         {messages.map(message => (
           <View key={message.timetoken}       
                 style={styles.messageContainer}>
             <View style={styles.avatar}>
               <Text style={styles.avatarContent}>{message.author}</Text>
             </View>
             <View style={styles.messageContent}>
               <Text>{message.content}</Text>
             </View>
           </View>
         ))}
       </ScrollView>
       <View style={styles.bottomContainer}>
         <TextInput
           style={styles.textInput}
           value={input}
           onChangeText={setInput}
           onSubmitEditing={handleSubmit}
           returnKeyType="send"
           enablesReturnKeyAutomatically={true}
           placeholder="Type your message here..."
         />
         <View style={styles.submitButton}>
           {input !== "" && <Button color="#008f2b" mode="contained" onPress={handleSubmit}>Send</Button>}
         </View>
       </View>
                        
                        <Button
                          mode="contained"
                          style={{marginBottom:'1%', backgroundColor:'#008f2b', marginHorizontal:'20%'}}
                          onPress={() => setShow(false)}
                        >
                          Close
                          </Button>
                          
                          </KeyboardAvoidingView>
   </SafeAreaView>
                        </View>
                    </View>
                </Modal>

                {/* <Modal animationType='fade' transparent={true} visible={showu}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                        <View style={{ backgroundColor: 'white', width:'70%', height:'40%', flexDirection:'row'}}>
                        <SafeAreaView style={styles.outerContainer}>
     
                        <View style={styles.HeaderImage}>
                <MIcon style={{alignSelf:'center'}} name="account-circle"  size={100} />
                <Text style={[styles.HeaderText,{alignSelf:'center'}]}>
                    {rider}
                </Text>
                <Text style={[styles.HeaderText,{alignSelf:'center'}]}>
                    {rphone}
                </Text>
            </View>

            <View style={{flexDirection:'row', marginBottom:'5%', marginTop:'5%', alignItems:'center'}}>
            
            <TouchableOpacity onPress={() => makeCall()}>
              <MIcon name='phone' size={30} color={'#008f2b'} style={{ alignSelf:'flex-start', marginHorizontal:'25%'}} />
            </TouchableOpacity>
            
 <TouchableOpacity onPress={() => setShow(true)}>
              <MIcon name='message' size={30} color={'#008f2b'} style={{ alignSelf:'flex-end', marginHorizontal:'5%'}} />
            </TouchableOpacity>

                          </View>
                        
                        <Button
                          mode="contained"
                          style={{ backgroundColor:'#008f2b', marginHorizontal:'10%'}}
                          onPress={() => setShowu(false)}
                        >
                          Close
                          </Button>
                        
                        </SafeAreaView>
                        </View>
                    </View>
                </Modal> */}

      <MapView 
      style={styles.map} 
      initialRegion={{
       latitude:latitude,
       longitude:longitude,
       latitudeDelta: 0.005,
       longitudeDelta: 0.05
      }}
      showsUserLocation={ true }
//         region={ this.state.region }
//         onRegionChange={ region => this.setState({region}) }
//         onRegionChangeComplete={ region => this.setState({region}) }
      >

      {!!latitude && !!longitude && <MapView.Marker
         coordinate={{"latitude":latitude,"longitude":longitude}}
         title={"Your Location"}
       />}

       {!!cordLatitude && !!cordLongitude && <MapView.Marker
          coordinate={{"latitude":cordLatitude,"longitude":cordLongitude}}
          title={"Rider"}
        />}

       {!!latitude && !!longitude && x == 'true' && <MapView.Polyline
            coordinates={coords}
            strokeWidth={2}
            strokeColor="red"/>
        }

        {!!latitude && !!longitude && x == 'error' && <MapView.Polyline
          coordinates={[
              {latitude: latitude, longitude: longitude},
              {latitude: cordLatitude, longitude: cordLongitude},
          ]}
          strokeWidth={2}
          strokeColor="red"/>
         }
      </MapView>
      <View style={{flexDirection:'row', alignItems:'flex-end', alignSelf:'flex-end'}}>
      {/* <Button
        mode="contained"
        style={{marginLeft:'2%', marginBottom:'5%', backgroundColor:'#008f2b'}}
       onPress={makeCall}
       >
        Call
      </Button>*/}
      <Button
        mode="contained"
        style={{marginLeft:'2%', marginBottom:'5%', backgroundColor:'#008f2b'}}
       onPress={() => setShow(true)}
       >
        Chat
      </Button> 
      {/* <TouchableOpacity onPress={RiderData}>
              <FontAwesome name='user-alt' size={40} color={'#008f2b'} style={{ alignSelf:'flex-end', marginHorizontal:'15%', marginBottom: '25%'}} />
        </TouchableOpacity> */}
      {/* <Button
        mode="contained"
        style={{marginLeft:'2%', marginBottom:'5%', backgroundColor:'#008f2b'}}
       onPress={RiderData}
       >
        User
      </Button> */}
      </View>
      </View>
    );
        // }
        // else{
        //   return(
        //     <View style={[styles.container]}>
        //       <Text style={{alignSelf:'center', marginBottom:'5%'}}>Finding a delivery pro</Text>
        //        <ActivityIndicator size="small" color="#00ff00" />
        //      </View>
        //   )
        // }
  }

const styles = StyleSheet.create({
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  outerContainer: {
    width: "100%",
    height: "100%",
  },
  innerContainer: {
    width: "100%",
    height: "100%",
  },
  topContainer: {
    flex: 1,
    width: "100%",
    flexDirection: 'column-reverse',
    paddingHorizontal: 16,
  },
  messageContainer: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
    backgroundColor: "lightgrey",
    padding: 8,
    borderRadius: 4,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 50,
    overflow: "hidden",
    marginRight: 16
  },
  avatarContent: {
    fontSize: 30,
    textAlign: "center",
    textAlignVertical: "center"
  },
  messageContent: {
    flex: 1
  },
  bottomContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#fff",
  },
  submitButton: {
    marginLeft:'1%',
  },
  container: {
    flex: 1,
    justifyContent: "center"
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10
  }
});

export default LinkUser;