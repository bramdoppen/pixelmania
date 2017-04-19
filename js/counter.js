var database;
var globalTimer = 0;
var localTime = 0;

// // Initialize Firebase
// var config = {
//     apiKey: "AIzaSyA-xiYdjBOjLc8n_LwMUgxM5aaMZ3pnPgg",
//     authDomain: "pixelmaker-7edd2.firebaseapp.com",
//     databaseURL: "https://pixelmaker-7edd2.firebaseio.com",
//     projectId: "pixelmaker-7edd2",
//     storageBucket: "pixelmaker-7edd2.appspot.com",
//     messagingSenderId: "213459368748"
// };
// firebase.initializeApp(config);
// database = firebase.database();

// globalTime();
localTime = new Date().getTime();
if (globalTimer > localTime - 180000) {
    // initTimerDB();
    // globalTime();
}

function zero(x, y) {

}

function globalTime() {
    var ref = database.ref('timer');
    ref.once('value', function(snapshot) {
        globalTimer = snapshot.val();
    }, errData);
}

function errData(err) {
    console.log("error");
    console.log(err);
}
