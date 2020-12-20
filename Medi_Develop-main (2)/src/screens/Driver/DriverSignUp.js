import React,{useState,useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import theme from '../../themes';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebase from 'firebase';
import CommonStyles from '../../CommonStyles';

const DriverSignUp = (props) => {
    const [buinessPhone,setPhone] = useState("");
    const [email,setEmail] = useState("");
    const [Name,setName] = useState("");
    const [bloodGroup,setBloodGroup] = useState("");
    const [age, setAge] = useState("");
    const [images,setImages] = useState([]);
    const [carImages,setCarImages] = useState([]);
    const [registrationNumber,setRegistrationNumber] = useState("");
    const [carModal,setCarModal] = useState("");
    const [carName, setCarName] = useState("");
    const [activity,showActivity] = useState(false);
    const [userUID,setUserKey] = useState("");

    let okArray = [false,false,false,false,false,false,false];

    useEffect(() => {
        async function getUserInfo(){
            const value = await AsyncStorage.getItem('@UserKey');
            console.log('UserKey'+value);
            if(value!==null){
                const rootRef = firebase.database().ref('users/'+value);
                rootRef.once('value').then((snapshot)=>{
                    const user = snapshot.val();
                    setUserKey(value);
                    setPhone(user.Phone);
                    setEmail(user.Email);
                    setName(user.FirstName+" "+user.LastName);
                    const birthDate = new Date(user.DateOfBirth);
                    setAge(global.calculateAge(birthDate));
                });
            }
        }
        getUserInfo();
    }, [])
    function getImagesSeleceted(Images){
        if(Images){
            setImages(Images);
        }
    }
    function getCarImages(Images){
        if(Images){
            setCarImages(Images);
        }
    }
    async function uploadImages(){
        const folderName = "DriverLicence/";
        const carFolder = "Cars/";
        const metadata = {
            "content-type":'image/jpeg'
        }
        const frontPictureRef = firebase.storage().ref().child(folderName+images[0].name);
        const backPictureRef = firebase.storage().ref().child(folderName+images[1].name);
        const carImage1 = firebase.storage().ref().child(carFolder+carImages[0].name);
        const carImage2 = firebase.storage().ref().child(carFolder+carImages[1].name);

        const urlFront = await frontPictureRef.put(images[0],metadata);
        const urlBack = await backPictureRef.put(images[1],metadata);
        const car1 = await carImage1.put(carImages[0],metadata);
        const car2 = await carImage2.put(carImages[1],metadata);

        const urls = Promise.all([
            urlFront.ref.getDownloadURL(),
            urlBack.ref.getDownloadURL(),
            car1.ref.getDownloadURL(),
            car2.ref.getDownloadURL()
        ]);
        return urls;
    }
    async function saveDriver(){
        showActivity(true);
        let hasError = false;
        for(var ok of okArray){
            if(ok==false){
                hasError=true;
                break;
            }
        }
        if(hasError){
            Alert.alert("Invalid or Incomplete Information","Please Complete the Fields according to the rules mentioned below!");    
            showActivity(false);
        }
        else{
            let saveDriver = false;
            let driverKey = "";
            await uploadImages().then(urls=>{
                const rootRef = firebase.database().ref().child('drivers');
                driverKey = rootRef.push({
                    CarName:carName,
                    CarModel:carModal+"",
                    RegistrationNumber:registrationNumber,
                    CarImageO:urls[2],
                    CarImageS:urls[3],
                    BusinessPhone:buinessPhone,
                    FrontPicture:urls[0],
                    BackPicture:urls[1],
                    UserKey:userUID,
                    Status:"Pending"
                }).key;
                firebase.database().ref('users').child(userUID).update({
                    DriverKey:driverKey
                });
                Alert.alert("Request Pending",'Your Driver Request is now pending in the approval list \n\nYou will be informed in a few days about the status of the application');
                saveDriver = true;
            }).catch(error=>{
                Alert.alert("Error While Saving Driver",error.message);
                showActivity(false);
                saveDriver = false;
            });
            if(saveDriver){
                await AsyncStorage.setItem('@DriverKey',driverKey,err=>{
                    console.log(err);
                });
                props.route.params.setDriverStatus("Driver Application Pending|Please wait till we approve your application");
                props.navigation.goBack();
            }
        }
    }
    function executeRule(ruleType,value){
        let length = value.length;
        if(length==0){
            return <View></View>
        }
        else{
            switch(ruleType){
                case "Name":
                    if(length>=3){
                        okArray[0] = true;
                        return <MaterialIcons name="done-all" size={50} color={theme.success} style={CommonStyles.IconStyles}/>
                    }
                    else{
                        okArray[0] = false;
                        return <MaterialIcons name="error" size={40} color={theme.error} style={CommonStyles.IconStyles}/>
                    }
                case "Modal":
                    const thisyear = new Date().getFullYear();
                    const checkyear = parseInt(value);
                    if(checkyear>=1980 && checkyear<=thisyear){
                        okArray[1] = true;
                        return <MaterialIcons name="done-all" size={40} color={theme.success} style={CommonStyles.IconStyles}/>
                    }
                    else{
                        okArray[1] = false;
                        return <MaterialIcons name="error" size={40} color={theme.error} style={CommonStyles.IconStyles}/>
                    }
                case "Phone":
                    if(length==11&&value.match(/^[0-9]+$/)!=null){
                        okArray[2] = true;
                        return <MaterialIcons name="done-all" size={40} color={theme.success} style={CommonStyles.IconStyles}/>
                    }
                    else{
                        okArray[2] = false;
                        return <MaterialIcons name="error" size={40} color={theme.error} style={CommonStyles.IconStyles}/>
                    }
                case "Age":
                    if(value>=18&&value<=45){
                        okArray[3] = true;
                        return <MaterialIcons name="done-all" size={40} color={theme.success} style={CommonStyles.IconStyles}/>
                    }
                    else{
                        okArray[3] = false;
                        return <MaterialIcons name="error" size={40} color={theme.error} style={CommonStyles.IconStyles}/>
                    }
                case "Registration":
                    let e = /[A-Z]{2,3}-[0-9]{3,4}/;
                    if(value.search(e)>=0){
                        okArray[4] = true;
                        return <MaterialIcons name="done-all" size={40} color={theme.success} style={CommonStyles.IconStyles}/>
                    }
                    else{
                        okArray[4] = false;
                        return <MaterialIcons name="error" size={40} color={theme.error} style={CommonStyles.IconStyles}/>
                    }
                case "Images":
                    if(value.length==2){
                        okArray[5] = true;
                        return <MaterialIcons name="done-all" size={40} color={theme.success} style={CommonStyles.IconStyles}/>
                    }
                    else{
                        okArray[5] = false;
                        return <MaterialIcons name="error" size={40} color={theme.error} style={CommonStyles.IconStyles}/>
                    }
                    case "CarImages":
                        if(value.length==2){
                            okArray[6] = true;
                            return <MaterialIcons name="done-all" size={40} color={theme.success} style={CommonStyles.IconStyles}/>
                        }
                        else{
                            okArray[6] = false;
                            return <MaterialIcons name="error" size={40} color={theme.error} style={CommonStyles.IconStyles}/>
                    }
            }
        }
    }
    return(
        <View>
            <View style={{marginTop:70}}>

            </View>
            <ScrollView>
            <Text style={CommonStyles.MainHeading}>Sign Up Here... {'\n'}Let's Help Together!</Text>
            
            <View style={CommonStyles.OtherView}>
                <TextInput 
                    value={carName}
                    placeholder="Enter Car Company and Name"
                    placeholderTextColor={theme.white}
                    onChangeText={(text)=>setCarName(text)}
                    style={CommonStyles.TextStyles}
                    keyboardType="default"
                />
                {carName?executeRule("Name",carName):null}
            </View>
            <Text style={CommonStyles.RestrictionText}>Invalid Car Name Applications will be Rejected</Text>

            <View style={CommonStyles.OtherView}>
                <TextInput 
                    value={carModal}
                    placeholder="Model Year of your Car"
                    placeholderTextColor={theme.white}
                    onChangeText={(text)=>setCarModal(text)}
                    style={CommonStyles.TextStyles}
                    keyboardType="number-pad"
                />
                {carModal?executeRule("Modal",carModal):null}
            </View>
            <Text style={CommonStyles.RestrictionText}>Between 1980-{new Date().getFullYear()}</Text>

            <View style={CommonStyles.OtherView}>
                <TouchableOpacity style={CommonStyles.TextStyles}onPress={()=>{
                    props.navigation.navigate('SelectImages',{
                        setImages:getCarImages
                    });
                }}>
                    <Text style={{color:'white',fontSize:16}}>{carImages.length>0?carImages.length+" Image(s) Selected":"Choose Your Car Images"}</Text>
                </TouchableOpacity>
                {carImages?executeRule("CarImages",carImages):null}
            </View>
            <Text style={CommonStyles.RestrictionText}>Select 2 Images of your Car</Text>

            <View style={CommonStyles.OtherView}>
                <TextInput 
                    value={registrationNumber}
                    placeholder="Your Car Registration Number"
                    placeholderTextColor={theme.white}
                    style={CommonStyles.TextStyles}
                    onChangeText={(text)=>setRegistrationNumber(text.replace(" ","-"))}
                    keyboardType="name-phone-pad"
                    autoCapitalize="characters"
                />
                {registrationNumber?executeRule("Registration",registrationNumber):null}
            </View>
            <Text style={CommonStyles.RestrictionText}>
                Azad Jammu{' & '}Kashmir Format: AA-111{'\n'}
                Balochistan Format: AA-1111{'\n'}
                Islamabad Format: AA-111{'\n'}
                Punjab Format: AAA-1111{'\n'}
                Sindh Format: AAA-111{'\n'}
                KPK Format: AA-111
            </Text>

            <View style={CommonStyles.OtherView}>
                <TextInput 
                    value={buinessPhone}
                    placeholder="Your Active Phone Number"
                    placeholderTextColor={theme.white}
                    onChangeText={(text)=>setPhone(text)}
                    style={CommonStyles.TextStyles}
                    keyboardType="number-pad"
                />
                {buinessPhone?executeRule("Phone",buinessPhone):null}
            </View>
            <Text style={CommonStyles.RestrictionText}>Phone Number you will use to accept rides</Text>

            <View style={CommonStyles.OtherView}>
                <TextInput 
                    value={age+""}
                    placeholder="Enter Your Age"
                    placeholderTextColor={theme.white}
                    style={CommonStyles.TextStyles}
                    keyboardType="number-pad"
                    editable={false}
                />
                {age?executeRule("Age",age):null}
            </View>
            <Text style={CommonStyles.RestrictionText}>Age Limit 18-45</Text>

            <View style={CommonStyles.OtherView}>
                <TouchableOpacity style={CommonStyles.TextStyles}onPress={()=>{
                    props.navigation.navigate('SelectImages',{
                        setImages:getImagesSeleceted
                    });
                }}>
                    <Text style={{color:'white',fontSize:16}}>{images.length>0?images.length+" Image(s) Selected":"Choose Licence Front and Back Image"}</Text>
                </TouchableOpacity>
                {images?executeRule("Images",images):null}
            </View>

            <Text style={CommonStyles.RestrictionText}>Take or Choose Front and Back Side of your Licence</Text>
            <TouchableOpacity style={CommonStyles.SaveButton} onPress={async()=>await saveDriver()}>
                {activity==false?(
                    <Text style={CommonStyles.SaveText}>Save Information</Text>
                ):(
                    <ActivityIndicator size={60} color={theme.white} style={CommonStyles.SaveText}/>
                )}
            </TouchableOpacity>

            <View style={{marginTop:100}}>

            </View>
        </ScrollView>
    </View>
    );
}

const styles = StyleSheet.create({
  MainHeading: {
    fontSize: 28,
    fontWeight: "bold",
    padding: 30,
    color: theme.tabBar,
    paddingTop:0
  },
  OtherView: {
    flexDirection: "row",
    backgroundColor: theme.tabBar,
    width: "90%",
    alignSelf: "center",
    borderRadius: 10,
  },
  TextStyles: {
    padding: 15,
    alignSelf: "center",
    color: theme.white,
    flex: 0.9,
    fontSize:16
  },
  IconStyles: {
    justifyContent: "center",
    alignItems: "center",
    textAlignVertical: "center",
  },
  RestrictionText: {
    padding: 22,
    color: theme.tabBar,
    paddingTop: 0,
  },
  SaveButton:{
    backgroundColor: theme.secondary,
    width: "50%",
    alignSelf: "flex-start",
    borderRadius: 20,
    marginLeft:20
  },
  SaveText: {
    padding: 15,
    color: theme.white,
    fontSize:22,
    fontWeight:'bold',
    textAlign:'center',
  },
});

export default DriverSignUp;