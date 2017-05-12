var database;
var pixelValues = [];
var localTime;
var serverTime;
var timeDiff;
var roundLength = 100;
var field = {
    width: 800,
    height: 800
}
var teamOne = {
    score: 0,
    img: 'cat',
    imgPixels: []
}
var teamTwo = {
    score: 0,
    img: 'firefox',
    imgPixels: []
}

function preload() {
    fontBold = loadFont('./assets/courbd.ttf');
}

function setup() {
    textFont('Courier New');
    // noCursor();
    localTime = new Date().getTime();

    database = firebase.database();

    getServerTime();

    pixelValues = initializePixelValues(field.width, field.height);
    teamOne.imgPixels = initializePixelValues(field.width, field.height);
    teamTwo.imgPixels = initializePixelValues(field.width, field.height);
    updatePixelValues(field.width, field.height, 'pixels/', pixelValues);
    updatePixelValues(field.width, field.height, 'images/cat/', teamOne.imgPixels);
    updatePixelValues(field.width, field.height, 'images/firefox/', teamTwo.imgPixels);
}

console.log(pixelValues);

function getServerTime() {
    var ref = database.ref('time');
    ref.on('value', function(snapshot) {
        serverTime = snapshot.val();
        console.log(serverTime);
    }, errData);
}

// function initializePixelValues(width, height) {
//     for (var col = 0; col < width / 20; col++) {
//         pixelValues.push([]);
//         for (var row = 0; row < height / 20; row++) {
//             pixelValues[col][row] = 8;
//         }
//     }
// }

// function updatePixelValues(width, height) {
//     for (var col = 0; col < width / 20; col++) {
//         for (var row = 0; row < height / 20; row++) {
//             getPixelValue(col, row);
//         }
//     }
// }
//
// function getPixelValue(col, row) {
//     var ref = database.ref('pixels/' + col + '/' + row + '/color');
//     ref.on('value', function(snapshot) {
//         var colorValue = snapshot.val();
//         pixelValues[col][row] = colorValue;
//     }, errData);
// }

function initializePixelValues(width, height) {
    var arr = [];
    for (var col = 0; col < width / 20; col++) {
        arr.push([]);
        for (var row = 0; row < height / 20; row++) {
            arr[col][row] = 8;
        }
    }
    return arr;
}

function updatePixelValues(width, height, destination, arr) {
    for (var col = 0; col < width / 20; col++) {
        for (var row = 0; row < height / 20; row++) {
            getPixelValue(col, row, destination, arr);
        }
    }
}

function getPixelValue(col, row, destination, arr) {
    var ref = database.ref(destination + col + '/' + row + '/color');
    ref.on('value', function(snapshot) {
        var colorValue = snapshot.val();
        arr[col][row] = colorValue;
    }, errData);
}

function updateScore(width, height) {
    teamOne.score = 0; teamTwo.score = 0;
    for (var col = 0; col < width / 20; col++) {
        for (var row = 0; row < height / 20; row++) {
            teamOne.score += countMatchingColors(col, row, teamOne);
            teamTwo.score += countMatchingColors(col, row, teamTwo);
        }
    }
    // console.log(teamOne.score + ' / 1600', teamTwo.score + ' / 1600');
}

function countMatchingColors(col, row, team) {
    var matchingColor = false;
    if (team.imgPixels[col][row] === pixelValues[col][row]) {
        matchingColor = true;
    }
    if (matchingColor) {
        return 1;
    } else {
        return 0;
    }
    // switch (pixelValues[col][row]) {
    //     case 'DarkTurquoise': teamScore[0]++; break;
    //     case 'GreenYellow': teamScore[1]++; break;
    // }
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
