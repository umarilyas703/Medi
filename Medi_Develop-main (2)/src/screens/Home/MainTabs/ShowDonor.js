import React,{useState,useEffect} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import theme from '../../../themes';
import CommonStyles from '../../../CommonStyles';
import { MaterialIcons } from '@expo/vector-icons';
const ShowDonor = (props) =>{
    const [user] = useState(props.Donor);
    return(
        <View style={{backgroundColor:'#f2f2f2',width:'95%',alignSelf:'center',marginTop:'20%',borderRadius:20}}>
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
                            props.handlerModal();
                        }}
                        >
                            <MaterialIcons name="arrow-back" size={40} color="white" style={{alignSelf:'center',width:'100%',marginTop:25,paddingLeft:20}}/>
                    </TouchableOpacity>
                    <View style={{flex:0.8}}>
                        <Text style={[CommonStyles.MainHeading,styles.FontProfile]}>Donor Information</Text>
                    </View>
                </View>
            </View>
            <View style={styles.Lower}>
                <Image source={{uri:user.Photo}} style={styles.ImageStyle} resizeMode="stretch"/>
                <Text style={[styles.Name,{paddingTop:'5%'}]}>{user.Name}</Text>
                <Text style={[styles.Name,{fontSize:15,fontWeight:'normal'}]}>{user.Gender} | {user.Phone} | Age {user.Age}</Text>
            </View>
            <TouchableOpacity style={{marginTop:'5%'}} onPress={()=>{
                    const message = "Hello Dear "+user.Name+'\n'+'Thank You for accepting my request!\nKindly Help me out and make yourself a hero for us...\nThank You In Advance'
                    var url = `sms:${user.Phone}${Platform.OS === "ios" ? "&" : "?"}body=${message}`
                    Linking.openURL(url);
                }}>
                    <Text style={{
                        backgroundColor:'white',
                        textAlign:'center',
                        color:'white',
                        fontWeight:'bold',
                        borderRadius:20,
                        padding:10,
                        fontSize:16,
                        width:'88%',
                        alignSelf:'center',
                        borderColor:theme.tabBar,
                        borderWidth:1.5,
                        color:theme.tabBar,
                        shadowOpacity:1,
                        elevation:3
                    }}>
                        Send Emergency Message
                    </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flex:0.7,marginTop:'5%'}} onPress={()=>{
                    Linking.openURL(`tel:${user.Phone}`)
            }}>
                <Text style={{
                        backgroundColor:'white',
                        textAlign:'center',
                        color:'white',
                        fontWeight:'bold',
                        borderRadius:20,
                        padding:10,
                        fontSize:16,
                        width:'88%',
                        alignSelf:'center',
                        borderColor:theme.secondary,
                        borderWidth:1.5,
                        color:theme.secondary,
                        shadowOpacity:1,
                        elevation:3
                }}>
                    Contact Donor
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    Upper: { 
        height: 160, 
        backgroundColor: theme.tabBar, 
        borderRadius:10,
        flexDirection: 'row',
        borderBottomLeftRadius:30,
        borderBottomRightRadius:30
    },
    FontProfile:{
        color: theme.white,
        marginTop: '8%',
        fontSize: 25,
        paddingLeft:5,
        width:'100%'
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
        height:'40%',
        backgroundColor:theme.secondary,
        elevation:4
    },
    Name:{
        textAlign:'center',
        fontSize:19,
        fontWeight:'bold',
        color:'white'
    },
    Email:{
        textAlign:'center',
        fontSize:16,
        fontWeight:'bold',
        color:'white',
    },
    Container:{
        flexDirection:'row',margin:1
    },
    icon:{
        flex:0.2,padding:10,alignSelf:'center',textAlignVertical:'center'
    },
    Text:{
        flex:0.8,fontSize:18,fontWeight:'bold',textAlignVertical:'center'
    }
})

export default ShowDonor;