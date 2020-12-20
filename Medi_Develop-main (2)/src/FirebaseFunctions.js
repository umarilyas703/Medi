import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

async function setDriverStatus(Status){
    await AsyncStorage.setItem('@DriverStatus',Status);
}
async function getDriverKey(){
    const value = await AsyncStorage.getItem('@DriverKey');
    return value;
}
async function getDriverFromID(){
    const ID = await getDriverKey();
    const rootRef = firebase.database().ref('drivers/'+ID);
    let _User = {};
    await rootRef.once('value').then(async function(snapshot){
        _User = snapshot.val();
    }).catch(err=>{
        return err;
    });
    return _User;
}
async function getDriverStatus(){
    const ID = await getDriverKey();
    let _Status = "0";
    if(ID){
        const rootRef = firebase.database().ref('drivers/'+ID);
        await rootRef.once('value').then(async function(snapshot){
            const {Status} = snapshot.val();
            setDriverStatus(Status);
            switch(Status){
                case "Pending":
                    _Status = ("Driver Application Pending|Please wait till we approve your application");
                    break;
                case "Approved":
                    _Status = ("Driver Application Approved|Your Driver Application Is Approved!");
                    break;
                case "Rejected":
                    _Status = ("Application not accepted!|Email us for any queries");
                    break;
                default:
                    _Status = ("0")
                    break;
            }
        }).catch(err=>{
            console.log(err);
            _Status="0";
        })
    }
    return _Status
}
async function getDonorFromID(ID){

}
async function getDonorKey(){
    const value = await AsyncStorage.getItem('@DonorKey');
    return value;
}
async function setDonorStatus(KeyReceived){
    await AsyncStorage.setItem('@DonorStatus',KeyReceived,err=>{
        console.log(err);
    });
}
async function getDonorStatus(){
    const ID = await getDonorKey();
    let _Status = "0";
    if(ID){
        const rootRef = firebase.database().ref('donors/'+ID);
        await rootRef.once('value').then(async function(snapshot){
            const {Status} = snapshot.val();
            setDonorStatus(Status);
            switch(Status){
                case "Pending":
                    _Status = ("Donor Application Pending|Please wait till we approve your application");
                    break;
                case "Approved":
                    _Status = ("Donor Application Approved|Your Donor Application Is Approved!");
                    break;
                case "Rejected":
                    _Status = ("Application not accepted!|Email us for any queries");
                    break;
                default:
                    _Status = ("0")
                    break;
            }
        }).catch(err=>{
            console.log(err);
            _Status="0"
        })
    }
    return _Status;   
}
async function getUser(){
    return firebase.auth().currentUser;
}
async function setKeys(email){
    console.log(email);
    await firebase.database().ref().child('users').orderByChild('Email').equalTo(email).once('value', async function(snapshot){
        const UserKey = Object.keys(snapshot.val())[0];
        const {DriverKey, DonorKey, DateOfBirth, Gender, Phone, BloodGroup } = snapshot.val()[UserKey];
        console.log(DriverKey, DonorKey, DateOfBirth, Gender);
        if(UserKey) await AsyncStorage.setItem('@UserKey', UserKey);
        if(DriverKey) await AsyncStorage.setItem('@DriverKey', DriverKey);
        if(DonorKey) await AsyncStorage.setItem('@DonorKey', DonorKey);
        if(DateOfBirth) await AsyncStorage.setItem('@DateOfBirth', DateOfBirth);
        if(Gender) await AsyncStorage.setItem('@UserGender', Gender);
        if(Phone) await AsyncStorage.setItem('@UserPhone', Phone);
        if(BloodGroup) await AsyncStorage.setItem('@UserBloodGroup', BloodGroup);
    });
}
async function fetchFirstAids(){
    let firstAids = [];
    await firebase.database().ref().child('firstaid').once('value', function(snapshots){
        const Keys = Object.keys(snapshots.val());
        for(let k of Keys){
            firstAids.push(snapshots.val()[k]);
        }
    });
    return firstAids;
}
async function saveBloodRequest(body, HandlerSubmit){
    const {Name, DateOfBirth, selectedDay, bloodgroup, gender, Message, UserKey, PlaceToDonate, Status } = body;
    firebase.database().ref().child('requestBlood').push({
        DateRequest:new Date().toDateString(),
        DateOfBirth,
        Name,
        SelectedDay:selectedDay,
        BloodGroup:bloodgroup,
        Gender:gender,
        Message,
        UserKey,
        PlaceToDonate,
        Status
    }).then(res=>{
        console.log(res.key);
        HandlerSubmit('Submitted');
    }).catch(Err=>{
        Alert.alert('Cannot Connect to Medi Backend','No Connection to connect with Server!');
    });
}
async function getBloodRequests(){
    let requests = []
    try{
        await firebase.database().ref().child('requestBlood').once('value', function(snapshots){
            console.log(typeof(snapshots));
            if(snapshots.val()){
                const Keys = Object.keys(snapshots.val());
                for(let k of Keys){
                    requests.push(Object.assign(snapshots.val()[k],{RequestId:k}));
                }
            }
            else{
                requests = ['No']
            }
        });
    }
    catch(E){
        requests = []
    }
    return requests;
}
async function updateBloodRequest(Donor,Id){
    firebase.database().ref().child('requestBlood').child(Id).update({
        Donor:Donor,
        Status:"Accepted"
    });
}
async function completeBloodRequest(Id){
    firebase.database().ref().child('requestBlood').child(Id).update({
        Status:"Completed"
    });

}
async function addCamera(camera){
    const key = firebase.database().ref().child('camera').push(camera);
}
async function getCamers(UserKey){
    let cameras = []
    try{
        await firebase.database().ref().child('camera').once('value', function(snapshots){
            if(snapshots.val()){
                const keys = Object.keys(snapshots.val());
                for(let k of keys){
                    let camera = snapshots.val()[k];
                    if(camera.UserKey===UserKey){
                        cameras.push({
                            CameraName:camera.CameraName,
                            RTSP:camera.RTSP,
                            ID:k
                        });
                    }
                }
            }
            else{
                cameras = ['No']
            }
        });
    }
    catch(E){
        cameras = []
    }
    return cameras;
}
async function setUpNotification(UserKey,props){
    if(UserKey){
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: false,
              shouldSetBadge: false,
            }),
        });
        firebase.database().ref().child('notifications').child(UserKey).update({
            Notification:"",
            Body:"",
            RTSP:"",
            CameraName:""
        });
        let RTSP = "";
        let CameraName = "";
        firebase.database().ref().child('notifications').child(UserKey).on('value',function(snapshot){;
            if(snapshot){
                const Notification = snapshot.val();
                RTSP = Notification['RTSP'];
                CameraName = Notification['CameraName'];        
                if(Notification['Notification']!==""){
                    Notifications.scheduleNotificationAsync({
                        content: {
                            title: Notification['Notification'],
                            body: Notification['Body']
                        },
                        trigger: null,
                    });
                }
            }
        });
        Notifications.addNotificationResponseReceivedListener(response=>{
            if(RTSP!==""){
                props.navigation.navigate('CameraStream',{
                    RTSP:RTSP,
                    CameraName:CameraName,
                    showEmergencyButton:true,
                    UserKey:UserKey
                });
            }
        });    
    }
}
async function getDriverInformation(DriverKey){
    let Body = {}
    let Vehicle = {}
    await firebase.database().ref().child('users').orderByChild('DriverKey').equalTo(DriverKey).once('value',function(snapshot){
        let ObjectFound = snapshot.val();
        let Keys = Object.keys(ObjectFound);
        ObjectFound = ObjectFound[Keys[0]];
        Keys = Object.keys(ObjectFound);
        for(let k of Keys){
            Body[k] = ObjectFound[k];
        }
    });
    await firebase.database().ref().child('drivers').orderByKey().equalTo(DriverKey).once('value',function(snapshot){
        let ObjectFound = snapshot.val();
        let Keys = Object.keys(ObjectFound);
        ObjectFound = ObjectFound[Keys[0]];
        Keys = Object.keys(ObjectFound);
        for(let k of Keys){
            Vehicle[k] = ObjectFound[k];
        }
    });
    Body['Vehicle'] = Vehicle;
    // console.log(Body);
    return Body;
}
async function saveTrustedContact(UserKey, TrustedContact){
    await firebase.database().ref().child('trustedContacts').child(UserKey).push(TrustedContact);
}
async function getTrustedContact(UserKey){
    const Contacts = [];
    await firebase.database().ref().child('trustedContacts').child(UserKey).once('value',function(snapshot){
        const ObjectFound = snapshot.val();
        const Keys = Object.keys(ObjectFound);
        for(let k of Keys){
            let contact = {
                Name:ObjectFound[k].Name,
                Phone:ObjectFound[k].Phone,
                Id:k,
            }
            Contacts.push(contact);
        }
        console.log(Contacts);
    });

    return Contacts;
}
const FirebaseFunctions = {
    getDriverFromID,
    getDriverKey,
    setDriverStatus,
    getDonorFromID,
    getDriverStatus,
    getDonorStatus,
    setUpNotification,
    getUser,
    setKeys,
    fetchFirstAids,
    saveBloodRequest,
    getBloodRequests,
    updateBloodRequest,
    completeBloodRequest,
    addCamera,
    getCamers,
    getDriverInformation,
    saveTrustedContact,
    getTrustedContact
}

export default FirebaseFunctions;