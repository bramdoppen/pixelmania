var database;
var mySound;
var canvas;
var pixelValues = [];
var fr = 60;
var nosound;
var startingTime;
var field = {
    width: 800,
    height: 800
}
var team1 = 0;
var team2 = 0;
var team3 = 0;
var team4 = 0;

function preload() {
    fontBold = loadFont('./assets/courbd.ttf');
    mySound = loadSound('sfx/Input/Input-04a.mp3');
}

function setup() {
    pixelDensity(1);
    frameRate(fr);
    noCursor();
    startingTime = millis();
    canvas = createCanvas(900, 800);
    canvas.parent('canvasContainer');
    nosound = ceil(field.width / 20) * ceil(field.height / 20);
    console.log(nosound);
    console.log('ELVIS HAS ENTERED THE BUILDING');

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

    setToActive();
    initiatePixelValues(field.width, field.height);
    // console.log(pixelValues);
    updatePixelValues(field.width, field.height);
    // while(pixelValues[39][39] == null) {
    //     //do nothing
    // }
    // console.log(pixelValues);

    // background(255);
    // drawGrid(canvas.width, canvas.height);
}

function setToActive() {
    var active = database.ref('activeUsers');
    active.once('value', function(snapshot) {
        var activeUsers = snapshot.val();
        activeUsers = activeUsers + 1;
        active.set(activeUsers);
        console.log('SET TO ACTIVE');
    }, errData);
}

function setToInactive() {
    var inactive = database.ref('activeUsers');
    inactive.once('value', function(snapshot) {
        var activeUsers = snapshot.val();
        activeUsers = activeUsers - 1;
        inactive.set(activeUsers);
        console.log('SET TO INACTIVE');
    }, errData);
}

function initiatePixelValues(width, height) {
    for (var i = 0; i < width / 20; i++) {
        pixelValues.push([]);
        for (var j = 0; j < height / 20; j++) {
            pixelValues[i][j] = 255;
        }
    }
}

function updatePixelValues(width, height) {
    for (var i = 0; i < width / 20; i++) {
        for (var j = 0; j < height / 20; j++) {
            getPixelValue(i, j)
        }
    }
}

function getPixelValue(x, y) {
    var ref = database.ref('pixels/' + x + '/' + y + '/color');
    ref.on('value', function(snapshot) {
        var colorValue = snapshot.val();
        pixelValues[x][y] = colorValue;
    }, errData);
}

function drawGrid(width, height) {
    for (var i = 0; i < width / 20; i++) {
        for (var j = 0; j < height / 20; j++) {
            drawPixel(i, j)
        }
    }
}

function drawPixel(x, y) {
    var color = pixelValues[x][y];
    noStroke();
    fill(color);
    rect(x * 20, y * 20, 20, 20);
}

function updateScore(width, height) {
    team1 = 0; team2 = 0; team3 = 0; team4 = 0;
    for (var i = 0; i < width / 20; i++) {
        for (var j = 0; j < height / 20; j++) {
            var color = countColors(i, j);
        }
    }
    // console.log(team1, team2, team3, team4);
}

function countColors(x, y) {
    switch (pixelValues[x][y]) {
        case 'DarkTurquoise': team1++; break;
        case 'GreenYellow': team2++; break;
        case 'Tomato': team3++; break;
        case 'MediumVioletRed': team4++; break;
    }
}

function drawScore() {
    var total = team1 + team2 + team3 + team4;
    var ratio = 720 / total;
    fill('DarkTurquoise');
    rect(840, 40, 20, team1 * ratio);
    fill('GreenYellow');
    rect(840, 40 + team1 * ratio, 20, team2 * ratio);
    fill('Tomato');
    rect(840, 40 + (team1 + team2) * ratio, 20, team3 * ratio);
    fill('MediumVioletRed');
    rect(840, 40 + (team1 + team2 + team3) * ratio, 20, team4 * ratio);
    // drawTeam(ratio, 880);
    showCurrentLeader(ratio);
}

function drawTeam(ratio, y) {
    fill('DimGray');
    textAlign('center');
    textFont('Courier New');
    textStyle(BOLD);
    textSize(16);
    text(team1, y, 40 + team1 / 2 * ratio);
    text(team2, y, 40 + (team1 + team2 / 2) * ratio);
    text(team3, y, 40 + (team1 + team2 + team3 / 2) * ratio);
    text(team4, y, 40 + (team1 + team2 + team3 + team4 / 2) * ratio);
}

function showCurrentLeader(ratio) {
    if (team1 > team2 && team1 > team3 && team1 > team4) {
        fill('DarkTurquoise');
        rect(840 - 8, 40, 3, team1 * ratio);
    } else if (team2 > team1 && team2 > team3 && team2 > team4) {
        fill('GreenYellow');
        rect(840 - 8, 40 + team1 * ratio, 3, team2 * ratio);
    } else if (team3 > team1 && team3 > team2 && team3 > team4) {
        fill('Tomato');
        rect(840 - 8, 40 + (team1 + team2) * ratio, 3, team3 * ratio);
    } else if (team4 > team1 && team4 > team2 && team4 > team3) {
        fill('MediumVioletRed');
        rect(840 - 8, 40 + (team1 + team2 + team3) * ratio, 3, team4 * ratio);
    } else {
        fill('DimGray');
        textAlign('LEFT');
        textFont('Courier New');
        textStyle(BOLD);
        textSize(16);
        text('TIE', 80 + (team1 + team2 + team3 + team4) * ratio, 855);
    }
}

function showReticle() {
    var x = floor(mouseX / 20);
    var y = floor(mouseY / 20);
    noFill();
    stroke(255, 100, 0);
    strokeWeight(1);
    rect(x * 20, y * 20, 20, 20);
    switch (pixelValues[x][y]) {
        case 'White': fill('DarkTurquoise'); noStroke(); break;
        case 'DarkTurquoise': fill('GreenYellow'); noStroke(); break;
        case 'GreenYellow': fill('Tomato'); noStroke(); break;
        case 'Tomato': fill('MediumVioletRed'); noStroke(); break;
        case 'MediumVioletRed': fill('DimGray'); noStroke(); break;
        case 'DimGray': fill('White'); stroke(255, 100, 0); break;
    }
    rect(x * 20 + 10, y * 20 - 10, 20, 20);
}

function mousePressed() {
    // if (mouseButton == LEFT) {
        changeColor();
    // }
    // prevent default
    return false;
}

// function touchStarted() {
//     showReticle();
//     // prevent default
//     return false;
// }

// function touchEnded() {
//     changeColor();
//     // prevent default
//     return false;
// }

function changeColor() {
    if (mouseX < 800 && mouseY < 800) {
        var x = floor(mouseX / 20);
        var y = floor(mouseY / 20);
        var ref = database.ref('pixels/' + x + '/' + y + '/color');
        ref.once('value', function(snapshot) {
            pixelcolor = snapshot.val();
            switch (pixelcolor) {
                case 'White': ref.set('DarkTurquoise'); break;
                case 'DarkTurquoise': ref.set('GreenYellow'); break;
                case 'GreenYellow': ref.set('Tomato'); break;
                case 'Tomato': ref.set('MediumVioletRed'); break;
                case 'MediumVioletRed': ref.set('DimGray'); break;
                case 'DimGray': ref.set('White'); break;
                default: ref.set('White');
            }
        }, errData);
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

function errData(err) {
    console.log("error");
    console.log(err);
}

window.addEventListener("unload", function (e) {
    setToInactive();
    console.log('ELVIS HAS LEFT THE BUILDING');
});

function draw() {
    background(255);
    drawGrid(field.width, field.height);
    updateScore(field.width, field.height);
    drawScore();
    showReticle();
    // camera(0, 0, 10);
    // plane(100,100);
}
