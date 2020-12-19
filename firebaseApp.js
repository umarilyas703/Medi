var admin = require("firebase-admin");

var serviceAccount = require("./medi-ebbe5-firebase-adminsdk-yijgk-2dad66e9a9.json");


function initalize(){
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://medi-ebbe5.firebaseio.com"
        });
        console.log('Firebase Admin Running!');
    }
    return admin;
}
module.exports = {initalize};