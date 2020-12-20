import React,{useEffect,useState,useLayoutEffect} from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ActivityIndicator, 
    ImageBackground, 
    Dimensions, 
    Modal, 
    TouchableOpacity,
    TouchableNativeFeedback,
    SectionList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import themes from '../../../themes';
import CommonStyles from '../../../CommonStyles';
import FirebaseFunctions from '../../../FirebaseFunctions';
import { MaterialIcons } from '@expo/vector-icons';
import ShowDonor from './ShowDonor';
const {width,height} = Dimensions.get('screen');
const Donations = (props) => {
    const [IsDonor,setIsDonor] = useState(false);
    const [BloodRequests,setBloodRequests] = useState([]);
    const [showRequest,setShowRequest] = useState(false);
    const [request,setRequest] = useState({});
    const [userKey] = useState(props.UserKey);
    const [sectionData,setSectionData] = useState([]);
    const [showDonor,setShowDonor] = useState(false);

    function filterRequestsWithCriteria(Criteria, Requests){
        const currentDate = new Date();
        for (let R of Requests){
            let requestDate =  new Date(calculateDate(R.DateRequest, R.SelectedDay));
            let DateDiff = Math.floor((requestDate - currentDate) / (1000*60*60*24))+1;
            if(DateDiff<0){
                DateDiff = 0
            }
            let Age = global.calculateAge(new Date(R.DateOfBirth));
            R = Object.assign(R,{requestDate:requestDate,DateDiff:DateDiff,Age:Age});  
        }
        const user = userKey;
        switch(Criteria){
            case "My Requests":
                Requests = Requests.filter((request)=>{
                    if(user === request.UserKey){
                        return request;
                    }
                });
                break;
            case "Emergency Requests":
                Requests = Requests.filter((request)=>{
                    if(request.UserKey!==user){
                        if(request.DateDiff<5 && request.Status!="Completed"){
                            return request;
                        }
                    }
                });
                break;
            case "Requests":
                Requests = Requests.filter((request)=>{
                    if(request.UserKey!==user){
                        if(request.DateDiff>=5 && request.Status!="Completed"){
                            return request;
                        }
                    }
                });
                break;
            case "Accepted Requests":
                break;
            case "Completed Requets":
                break;
        }
        return Requests
    }

    useEffect(()=>{
        async function getRequests(){
            setIsDonor(props.IsDonor);
            const sectionData = [];
            if(props.IsDonor){
                const Requests = await FirebaseFunctions.getBloodRequests();
                sectionData.push({
                    title: 'My Requests',
                    data:filterRequestsWithCriteria('My Requests', Requests)
                });
                sectionData.push({
                    title: 'Emergency Requests',
                    data:filterRequestsWithCriteria('Emergency Requests', Requests)
                });
                sectionData.push({
                    title: 'Requests',
                    data:filterRequestsWithCriteria('Requests', Requests)
                });
                // sectionData.push({
                //     title: 'Accepted Requests',
                //     data:filterRequestsWithCriteria('Accepted Requests', Requests)
                // });
                // sectionData.push({
                //     title: 'Completed Requets',
                //     data:filterRequestsWithCriteria('Completed Requets', Requests)
                // });
                setSectionData(sectionData);
            }
        }
        getRequests();
    },[]);
    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result.toDateString();
    }
    function calculateDate(DateRequest, SelectedDay){
        switch(SelectedDay){
            case "Emergency Needed":
                return DateRequest;
            case "1 Day":
                return addDays(new Date(DateRequest).toDateString(), 1);
            case "2 Days":
                return addDays(new Date(DateRequest).toDateString(), 2);
            case "3 Days":
                return addDays(new Date(DateRequest).toDateString(), 3);
            case "4 Days":
                return addDays(new Date(DateRequest).toDateString(), 4);
            case "5 Days":
                return addDays(new Date(DateRequest).toDateString(), 5);
            case "6 Days":
                return addDays(new Date(DateRequest).toDateString(), 6);
            case "7 Days":
                return addDays(new Date(DateRequest).toDateString(), 7);
            case "8 Days":
                return addDays(new Date(DateRequest).toDateString(), 8);
            case "9 Days":
                return addDays(new Date(DateRequest).toDateString(), 9);
            case "10 Days +":
                return addDays(new Date(DateRequest).toDateString(), 10);
        }
    }
    function getdaysLeftStyle(dayDiff){
        if(dayDiff<5){
            return styles.LeftValueRed
        }   
        else{
            return styles.LeftValue
        }
    }
    function openRequestModal(){
        setShowDonor(false);
        setShowRequest(true);
    }
    return(
        <View style={{height:height*0.50}}>
            <Modal
                visible={showDonor}
                onRequestClose={()=>setShowDonor(false)}
                onDismiss={()=>setShowDonor(false)}
                transparent
            >
                <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)'}}>
                    <ShowDonor Donor={request.Donor} handlerModal={openRequestModal}/>
                </View>
            </Modal>
            <Modal
                visible={showRequest}
                onDismiss={()=>setShowRequest(false)}
                onRequestClose={()=>setShowRequest(false)}
                transparent
            >
                <View style={{flex:1, backgroundColor:'rgba(0,0,0,0.6)'}}>
                    <View style={{backgroundColor:'white', height:request.Status==="Pending"?'65%':'75%', width:'95%', alignSelf:'center', borderRadius:20, marginTop:request.Status==="Pending"?'40%':'25%'}}>
                        <ImageBackground 
                            source={require("../../../../assets/FirstAid/header.png")}
                            style={{width:'100%',height:'62%',borderRadius:20}}
                            resizeMode={"cover"}    
                        >
                            <Text style={[CommonStyles.MainHeading,{fontSize:22,textAlign:'center',paddingTop:15,paddingBottom:1,color:'white'}]}>Blood Seeker Request</Text>
                            <View style={{marginTop:'17%'}}></View>
                            <View style={{flexDirection:'row',margin:7}}>
                                <Text style={styles.RightLabels}>Patient Name:</Text>
                                <View style={{flex:0.7}}>
                                    <Text style={styles.LeftValue}>{request.Name}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection:'row',margin:7}}>
                                <Text style={styles.RightLabels}>Patient Age:</Text>
                                <View style={{flex:0.7}}>
                                    <Text style={styles.LeftValue}>{request.Age}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection:'row',margin:7}}>
                                <Text style={styles.RightLabels}>Blood Group:</Text>
                                <View style={{flex:0.7}}>
                                    <Text style={styles.LeftValue}>{request.BloodGroup}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection:'row',margin:7}}>
                                <Text style={styles.RightLabels}>Place :</Text>
                                <View style={{flex:0.7}}>
                                    <Text style={styles.LeftValue}>{request.PlaceToDonate}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection:'row',margin:7}}>
                                <Text style={styles.RightLabels}>Message:</Text>
                                <View style={{flex:0.7}}>
                                    <Text style={styles.LeftValue}>{request.Message}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection:'row',margin:7}}>
                                <Text style={styles.RightLabels}>Date Needed:</Text>
                                <View style={{flex:0.7}}>
                                    <Text style={styles.LeftValue}>{request.requestDate?request.requestDate.toDateString():null}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection:'row',margin:7}}>
                                <Text style={styles.RightLabels}>Days Left:</Text>
                                <View style={{flex:0.7}}>
                                    <Text style={getdaysLeftStyle(request.DateDiff)}>{request.DateDiff} day(s)</Text>
                                </View>
                            </View>
                            <View style={{flexDirection:'row',margin:7}}>
                                <Text style={styles.RightLabels}>Status:</Text>
                                <View style={{flex:0.7}}>
                                    <Text style={styles.LeftValue}>{request.Status}</Text>
                                </View>
                            </View>
                        </ImageBackground>
                        {request.title==="My Requests"?(
                            <View style={{position:'absolute',bottom:10,justifyContent:'center',alignItems:'center',width:'100%'}}>
                                <TouchableOpacity style={{margin:6,width:'80%'}} onPress={()=>{
                                    if(request.Status==="Pending"){
                                        setShowRequest(false);
                                    }
                                    else{
                                        setShowRequest(false);
                                        setShowDonor(true);
                                    }
                                }}>
                                    <Text style={[styles.Button,{backgroundColor:themes.tabBar}]}>{request.Status==="Pending"?"Close":"View Donor"}</Text>
                                </TouchableOpacity>
                                {request.Status==="Accepted"&&(
                                    <TouchableOpacity style={{margin:6,width:'80%'}} onPress={async()=>{
                                        // Update Status to Completed
                                        await FirebaseFunctions.completeBloodRequest(request.RequestId);
                                        // Close Modal
                                        const req = Object.assign(request,{Status:'Completed'})
                                        setRequest(req);
                                        setShowDonor(false);
                                        setShowRequest(false);
                                    }}>
                                        <Text style={[styles.Button,{backgroundColor:themes.tabBar}]}>Complete Request</Text>
                                    </TouchableOpacity>                                    
                                )}
                            </View>
                        ):(
                            <>
                                {request.Status==="Pending"?(
                                    <View style={{flexDirection:'row',position:'absolute',bottom:10,justifyContent:'center',alignItems:'center',width:'100%'}}>
                                    <TouchableOpacity style={{flex:0.4,margin:6}} onPress={async()=>{
                                        await AsyncStorage.multiGet([
                                            "@UserDisplayName",
                                            "@UserPhotoUrl",
                                            "@DateOfBirth",
                                            "@UserGender",
                                            "@UserKey",
                                            "@UserPhone",
                                            "@UserBloodGroup"
                                        ]).then(async response=>{
                                            const Donor = {
                                                Name:response[0][1],
                                                Photo:response[1][1],
                                                DateOfBirth:response[2][1],
                                                Gender:response[3][1],
                                                UserKey:response[4][1],
                                                Phone:response[5][1],
                                                BloodGroup:response[6][1],
                                                Age:request.Age
                                            }
                                            console.log(Donor);
                                            await FirebaseFunctions.updateBloodRequest(Donor,request.RequestId);
                                            const req = Object.assign(request,{Status:'Accepted'})
                                            setRequest(req);
                                            setShowRequest(false);
                                        });
                                    }}>
                                        <Text style={styles.Button}>Accept</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{flex:0.4,margin:6}} onPress={()=>setShowRequest(false)}>
                                        <Text style={[styles.Button,{backgroundColor:themes.tabBar}]}>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                                ):(
                                    <View style={{position:'absolute',bottom:10,justifyContent:'center',alignItems:'center',width:'100%'}}>
                                        <TouchableOpacity style={{margin:6,width:'80%'}} onPress={()=>setShowRequest(false)}>
                                            <Text style={[styles.Button,{backgroundColor:themes.tabBar}]}>Close</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>
            {IsDonor?(
                <>
                {sectionData.length>0?(
                    <View style={{flex:1}}>
                        <SectionList
                            sections={sectionData}
                            keyExtractor={(item, index) => item.RequestId}
                            renderItem={({ item,index,section }) => (
                                <TouchableNativeFeedback key={item.RequestId} onPress={()=>{
                                    if(item.Status==="Completed"){

                                    }
                                    else{
                                        setRequest(Object.assign(item,{title:section.title}));
                                        setShowRequest(true);
                                    }
                                }}>
                                    <View style={styles.Container}>
                                        <View style={{flex:0.3}}>
                                            <Text style={{
                                                backgroundColor:["Emergency Needed","1 Day","2 Days","3 Days","4 Days"].indexOf(item.SelectedDay)>-1?'#d72323':themes.secondary,
                                                color:'white',
                                                padding:15,
                                                borderRadius:10,
                                                textAlign:'center',
                                                textAlignVertical:'center',
                                                fontSize:16,
                                                fontWeight:'bold',
                                                margin:10,
                                                height:65
                                            }}>{item.BloodGroup}</Text>
                                        </View>
                                        <View style={{padding:8, flex:0.8}}>
                                            <Text style={styles.Text}>{item.Name} | Age: {item.Age}</Text>
                                            <Text style={styles.Text}>Required On: {item.requestDate.toDateString()}</Text>
                                            <Text style={styles.Text}>Status: {item.Status}</Text>
                                        </View>
                                        <View >
                                            {item.Status!=="Completed"&&(
                                                <MaterialIcons name="navigate-next" size={40} color={themes.tabBar} style={styles.icon}/>
                                            )}
                                        </View>
                                    </View>
                                </TouchableNativeFeedback>                                        
                            )}
                            renderSectionHeader={({ section: { title } }) => (
                                <Text style={styles.Header}>{title}</Text>
                            )}
                        />
                    </View>
                ):(
                    <View>
                        <ActivityIndicator 
                            size={50}
                            color={themes.secondary}
                            style={{alignSelf:'center',marginTop:'30%'}}
                        />
                        <Text style={[styles.Heading,{fontSize:22, textAlign: 'center'}]}>Fetching Data{'\n'}Please Wait...</Text>
                    </View>
                )}
                </>
            ):(
                <ImageBackground
                    source={require('../../../../assets/humaans.png')}
                    style={{width:'100%', height:height*0.50}}
                    resizeMode="contain"
                >
                    <Text style={[CommonStyles.RestrictionText,{fontSize:25,fontWeight:'bold',marginTop:'5%'}]}>
                        Donor Request Pending
                    </Text>
            <Text style={[CommonStyles.RestrictionText,{fontSize:16, fontWeight:'bold'}]}>We are sorry but to maintain the quality{'\n'}of our service, you cannot access this{'\n'}page unless we approve you{'\n'}as a donor</Text>
                </ImageBackground>
            )}   
        </View>
    )
}

const styles = StyleSheet.create({
    Heading:{
        fontSize:35,
        fontWeight:'bold',
        padding:30,
        color:themes.tabBar
    },
    Image:{
        width:'100%', height:'95%', 
    },  
    Container:{
        flex:1,flexDirection:'row',margin:10,marginBottom:0,backgroundColor:'white',shadowColor:'black',shadowOpacity:1,elevation:5,borderRadius:10
    },
    Text:{
        flex:0.8,fontSize:14,fontWeight:'bold',textAlignVertical:'center',color:themes.tabBar
    },
    icon:{
        flex:0.2,padding:10,alignSelf:'center',textAlignVertical:'center',height:82
    },
    Header:{
        fontSize:22,
        fontWeight:'bold',
        textAlign:'left',
        padding:15,
        paddingBottom:0,
        marginBottom:2,
        borderRadius:10,
        color:themes.tabBar,
        width:'98%',
        borderBottomWidth:2,
        borderBottomColor:themes.tabBar,
    },
    SaveLife:{
        flex:0.5,
        textAlign:'center',
        color:themes.secondary,
        fontSize:18,
        fontWeight:'bold',
        paddingTop:'4%'
    },
    RightLabels:{
        paddingLeft:5,
        fontSize:13,
        flex:0.3,
        color:themes.tabBar,
        borderBottomColor:themes.tabBar
    },
    LeftValue:{
        textAlign:'center',
        fontSize:13,
        fontWeight:'bold',
        borderBottomWidth:2,
        color:themes.tabBar,
        borderBottomColor:themes.greyOutline,
        borderBottomWidth:0.4,
    },
    LeftValueRed:{
        textAlign:'center',
        fontSize:13,
        fontWeight:'bold',
        borderBottomWidth:2,
        color:"#d72323",
        borderBottomColor:themes.greyOutline,
        borderBottomWidth:0.4
    },
    Button:{
        fontSize:17,
        borderRadius:15,
        backgroundColor:themes.secondary,
        color:'white',
        textAlign:'center',
        padding:16,
        fontWeight:'bold'
    }

});
export default Donations;