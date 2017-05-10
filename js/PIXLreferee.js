var database;
var pixelValues = [];
var localTime;
var serverTime;
var timeDiff;
var roundLength = 600;
var field = {
    width: 800,
    height: 800
}
var teamScore = [0, 0];

function preload() {
    fontBold = loadFont('./assets/courbd.ttf');
}

function setup() {
    textFont('Courier New');
    // noCursor();
    localTime = new Date().getTime();

    database = firebase.database();

    getServerTime();

    initializePixelValues(field.width, field.height);
    updatePixelValues(field.width, field.height);
}

function getServerTime() {
    var ref = database.ref('time');
    ref.on('value', function(snapshot) {
        serverTime = snapshot.val();
        console.log(serverTime);
    }, errData);
}

function initializePixelValues(width, height) {
    for (var col = 0; col < width / 20; col++) {
        pixelValues.push([]);
        for (var row = 0; row < height / 20; row++) {
            pixelValues[col][row] = 255;
        }
    }
}

function updatePixelValues(width, height) {
    for (var col = 0; col < width / 20; col++) {
        for (var row = 0; row < height / 20; row++) {
            getPixelValue(col, row);
        }
    }
}

function getPixelValue(col, row) {
    var ref = database.ref('pixels/' + col + '/' + row + '/color');
    ref.on('value', function(snapshot) {
        var colorValue = snapshot.val();
        pixelValues[col][row] = colorValue;
    }, errData);
}

function updateScore(width, height) {
    teamScore[0] = 0; teamScore[1] = 0; teamScore[2] = 0; teamScore[3] = 0;
    for (var col = 0; col < width / 20; col++) {
        for (var row = 0; row < height / 20; row++) {
            var color = countColors(col, row);
        }
    }
    // console.log(teamScore[0], teamScore[1], teamScore[2], teamScore[3]);
}

function countColors(col, row) {
    switch (pixelValues[col][row]) {
        case 'DarkTurquoise': teamScore[0]++; break;
        case 'GreenYellow': teamScore[1]++; break;
        case 'Tomato': teamScore[2]++; break;
        case 'MediumVioletRed': teamScore[3]++; break;
    }
}

function errData(err) {
    console.log("error");
    console.log(err);
}

function updateTimer() {
    var timer = document.getElementById('timer');
    timeDiff = floor(new Date().getTime() - serverTime);
    if (timeDiff > roundLength * 1000) {
        gameLobby();
    } else if (timeDiff <= roundLength * 1000) {
        timer.innerHTML = roundLength - floor(timeDiff / 1000);
    }
}



function gameLobby() {
    initTimerDB();
    initPixelsDB();
}


function draw() {
    updateScore(field.width, field.height);
    updateTimer();
}
