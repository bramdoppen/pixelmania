var database;
var canvas;
var fr = 30;
var field = { width: 800, height: 800 }
var colorArray = ['DarkTurquoise', 'GreenYellow', 'Tomato', 'MediumVioletRed', 'DimGray', 'White'];

function setup() {
    time = new Date().getTime();
    canvas = createCanvas(900, 900);
    canvas.parent('canvasContainer');

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyA-xiYdjBOjLc8n_LwMUgxM5aaMZ3pnPgg",
        authDomain: "pixelmaker-7edd2.firebaseapp.com",
        databaseURL: "https://pixelmaker-7edd2.firebaseio.com",
        projectId: "pixelmaker-7edd2",
        storageBucket: "pixelmaker-7edd2.appspot.com",
        messagingSenderId: "213459368748"
    };
    firebase.initializeApp(config);
    database = firebase.database();
}

function zero(x, y) {

}

function draw() {
}
