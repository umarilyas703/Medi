import React,{useState, useEffect, useLayoutEffect} from 'react';
import { View, Text, TouchableNativeFeedback, FlatList, StyleSheet, Image, ScrollView } from 'react-native';
import theme from '../../../themes';
import CommonStyles from '../../../CommonStyles';
import FirebaseFunctions from '../../../FirebaseFunctions';
import * as firebase from 'firebase';

const FirstAid = (props) => {
    const [firstAids,setFirstAids] = useState([]);
    useLayoutEffect(()=>{
        setFirstAids(props.firstAids);
    },[]);
    return(
        <>
            {firstAids.map((item)=>(
                <TouchableNativeFeedback key={item.Aid} onPress={()=>{
                    props.props.navigation.navigate('WebView',{
                        source:item.Link,
                        aid:item.Aid
                    })
                }}>
                    <View style={styles.Container}>
                        <View style={{flex:0.3}}>
                            <Image source={{uri:item.ImageURL}} style={styles.Image} resizeMode="contain"/>
                        </View>
                        <View style={{flex:0.7}}>
                            <Text style={styles.Text}>{item.Aid}</Text>
                            <Text style={{letterSpacing:1, textAlign:'justify', padding:7}}>{item.Method}</Text>
                        </View>
                    </View>
                </TouchableNativeFeedback>
            ))}
        </>
    );
}
const styles = StyleSheet.create({
    Image:{
        width:'100%', height:'95%', 
    },  
    Container:{
        flex:1,flexDirection:'row',margin:10,marginBottom:0,backgroundColor:'white',shadowColor:'black',shadowOpacity:1,elevation:5,borderRadius:10
    },
    Text:{
        flex:0.8,fontSize:21,fontWeight:'bold',textAlignVertical:'center',color:theme.tabBar
    }    
})
export default FirstAid;