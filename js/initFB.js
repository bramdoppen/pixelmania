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

function initColorButtonsDB(colorArray) {
    for (var i = 0; i < colorArray.length; i++) {
        var colorButtons = database.ref('colorButtons/' + colorArray[i]);
        var data = {
            active: 1,
            colorCode: String(colorArray[i])
        }
        colorButtons.set(data);
        return colorArray[i];
    }
}

function initPixelsDB() {
    for (var i = 0; i < 800 / 20; i++) {
        for (var j = 0; j < 800 / 20; j++) {
            var ref = database.ref('pixels/' + i + '/' + j);
            var data = {
                color: 'White'
            }
            ref.set(data);
        }
    }
}

function initTimerDB() {
    var timer = database.ref('timer');
    timer.set(startingTime);
}

function draw() {
}
