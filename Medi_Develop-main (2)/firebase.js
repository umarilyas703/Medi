import * as firebase from 'firebase';

// Optionally import the services that you want to use
//import "firebase/auth";
//import "firebase/database";
//import "firebase/firestore";
//import "firebase/functions";
//import "firebase/storage";

// Initialize Firebase
// AIzaSyABx22NKx-KkYPnRBcW08dBx_vgcE16YYA
var firebaseConfig = {
    apiKey: "AIzaSyATCEL8llnCKfsDCSaXq_-fAvnaM_R1254",
    authDomain: "medi-ebbe5.firebaseapp.com",
    databaseURL: "https://medi-ebbe5.firebaseio.com",
    projectId: "medi-ebbe5",
    storageBucket: "medi-ebbe5.appspot.com",
    messagingSenderId: "922648936971",
    appId: "1:922648936971:web:b3e0bbcc1b873c78cd3d0e"
  };

function initalize(){
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    console.log("Firebase running!");
}
export default {initalize}
