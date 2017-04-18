var database;
var mySound;
var canvas;
var pixelValues = [];
var fr = 30;
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

var activeColor = 'White';
var activeColorIdentifier = 'Tomato';

var colorArray = ['DarkTurquoise', 'GreenYellow', 'Tomato', 'MediumVioletRed', 'DimGray', 'White']; //eenmalig nodig voor Setup van firebase
var buttonKeys;

function preload() {
    fontBold = loadFont('./assets/courbd.ttf');
    mySound = loadSound('sfx/Input/Input-04a.mp3');
}

function setup() {
    pixelDensity(1);
    frameRate(fr);
    // noCursor();
    startingTime = millis();
    time = new Date().getTime();
    canvas = createCanvas(900, 900);
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
    initializePixelValues(field.width, field.height);
    // console.log(pixelValues);
    updatePixelValues(field.width, field.height);
    // while(pixelValues[39][39] == null) {
    //     //do nothing
    // }
    // console.log(pixelValues);

    getButtonFromDB();
    // changeActiveColor('White');
}

// Code GUUS ---------------------------------------------------------------- //

function createColorButtonsDB(colorArray) {
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

function getButtonFromDB() {
    var buttonsPad = database.ref('colorButtons');
    buttonsPad.on("value", gotButtonData, errButton);
}

function gotButtonData(data) {
    // clear previous list
    var buttonListings = selectAll('.buttonListing');
    for (var i = 0; i < buttonListings.length; i++){
        buttonListings[i].remove();
    }
    var buttons = data.val();
    buttonKeys = Object.keys(buttons);
    for (var i = 0; i < buttonKeys.length; i++) {
        var k = buttonKeys[i];
        var colorCode = buttons[k].colorCode;
        var buttonLi = createElement("li");
        buttonLi.parent("colorButtonListParent");
        var colorButton = createElement("button", colorCode);
        buttonLi.child(colorButton);
        buttonLi.class('buttonListing');
        colorButton.id(colorCode);
        colorButton.style("background-color", colorCode);
        console.log(i, colorCode);

        function makeColorClickHandler(color) {
            return function() { changeActiveColor(color) }
        }

        colorButton.mousePressed(makeColorClickHandler(colorCode));
        if (i == buttonKeys.length - 1) {
            changeActiveColorSetup(colorCode);
        }
    }
}

function errButton() {
    console.log("error retrieving button data!!")
}
function changeActiveColor(colorCode) {
    var prevActiveColorButton = document.getElementById(activeColorIdentifier);
    var activeColorButton = document.getElementById(colorCode);

    prevActiveColorButton.className = "";
    activeColor = colorCode;
    activeColorIdentifier = colorCode;
    activeColorButton.className = "activeColor";
}

function changeActiveColorSetup(colorCode) {
    var activeColorButton = document.getElementById(colorCode);

    activeColorButton.className = "activeColor";
}

// rest --------------------------------------------------------------------- //

// function changeColor() {
//     var x = floor(mouseX / 100);
//     var y = floor(mouseY / 100);
//     // console.log(x, y);
//     var kleurWaardePad = database.ref('vierkanten/' + x + '/' + y + '/kleur');
//     kleurWaardePad.transaction(function(data) {
//         return data = activeColor;
//     });
//
//     // kleurWaardePad.set(100);
//     // pixelColor[x][y] = (pixelColor[x][y] + 100) % 255;
// }

// Code ROBIN --------------------------------------------------------------- //

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
            getPixelValue(col, row)
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

function drawGrid(width, height) {
    for (var col = 0; col < width / 20; col++) {
        for (var row = 0; row < height / 20; row++) {
            drawPixel(col, row)
        }
    }
}

function drawPixel(col, row) {
    var color = pixelValues[col][row];
    noStroke();
    fill(color);
    rect(col * 20, row * 20, 20, 20);
}

function updateScore(width, height) {
    team1 = 0; team2 = 0; team3 = 0; team4 = 0;
    for (var col = 0; col < width / 20; col++) {
        for (var row = 0; row < height / 20; row++) {
            var color = countColors(col, row);
        }
    }
    // console.log(team1, team2, team3, team4);
}

function countColors(col, row) {
    switch (pixelValues[col][row]) {
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
    if (x * 20 < field.width && y * 20 < field.height) {
        noFill();
        stroke(255, 100, 0);
        strokeWeight(1);
        rect(x * 20, y * 20, 20, 20);
        // switch (pixelValues[x][y]) {
        //     case 'White': fill('DarkTurquoise'); noStroke(); break;
        //     case 'DarkTurquoise': fill('GreenYellow'); noStroke(); break;
        //     case 'GreenYellow': fill('Tomato'); noStroke(); break;
        //     case 'Tomato': fill('MediumVioletRed'); noStroke(); break;
        //     case 'MediumVioletRed': fill('DimGray'); noStroke(); break;
        //     case 'DimGray': fill('White'); stroke(255, 100, 0); break;
        // }
        fill(activeColor);
        if (activeColor == 'White') {
            stroke(255, 100, 0);
        } else {
            noStroke();
        }
        rect(x * 20 + 10, y * 20 - 10, 20, 20);
    }
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
            // pixelcolor = snapshot.val();
            // switch (pixelcolor) {
            //     case 'White': ref.set('DarkTurquoise'); break;
            //     case 'DarkTurquoise': ref.set('GreenYellow'); break;
            //     case 'GreenYellow': ref.set('Tomato'); break;
            //     case 'Tomato': ref.set('MediumVioletRed'); break;
            //     case 'MediumVioletRed': ref.set('DimGray'); break;
            //     case 'DimGray': ref.set('White'); break;
            //     default: ref.set('White');
            ref.set(activeColor);
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
    text(floor(frameRate()), 100, 100);
    showReticle();
    // camera(0, 0, 10);
    // plane(100,100);
}
