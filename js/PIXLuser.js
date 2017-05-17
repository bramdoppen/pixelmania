var database;
database = firebase.database();
var gathering = new Gathering(database, 'Pixelmania Room');

var canvas;
var currentRound;
var pixelValues = [];
var fr = 120;
var localTime;
var serverTime;
var timeDiff;
var roundLength = 30;
var field = {
    width: 800,
    height: 800
}
var teamScore = [0, 0];
var team = 2;
var teamOne = {
    score: 0,
    img: '',
    imgName: 'cat',
    imgPixels: []
}
var teamTwo = {
    score: 0,
    img: '',
    imgName: 'joker',
    imgPixels: []
}

var activeColor = 7;
var activeColorIdentifier;

var showSelector = false;
var lastClickedX;
var lastClickedY;

var specialAttack = 5;


// var colorArray = ['DarkTurquoise', 'LightPink', 'GreenYellow', 'Peru', 'Tomato', 'MediumVioletRed', 'DimGray', 'White'];
// var colorArray = ['#026B99', '#028495', '#285E6F', '#603229', '#371D18', '#89756E', '#BBA69C', '#E8D6C1'];
var colorArray = [ '#EEE', '#EEE', '#EEE', '#EEE', '#EEE', '#EEE', '#EEE', '#EEE', '#EEE'];
var buttonKeys;
var winner;

function preload() {
    fontBold = loadFont('./assets/courbd.ttf');
    teamOne.img = loadImage('/assets/cat8c.jpg');
    teamTwo.img = loadImage('/assets/joker8c.jpg');
}

function setup() {
    team = round(random(0, 1)) + 1;
    console.log('team', team);
    pixelDensity(1);
    frameRate(fr);
    textFont('Courier New');
    localTime = new Date().getTime();
    canvas = createCanvas(1200, 840);
    canvas.parent('canvasContainer');

    getRoundNumber();
    getScore();
    getServerTime();
    getLoggedInUsers();

    getButtonFromDB();

    pixelValues = initializePixelValues(field.width, field.height);
    teamOne.imgPixels = initializePixelValues(field.width, field.height);
    teamTwo.imgPixels = initializePixelValues(field.width, field.height);
    // updatePixelValues(field.width, field.height, 'round/' + currentRound + '/pixels/', pixelValues);
    updatePixelValues(field.width, field.height, 'pixels/', pixelValues);
    updatePixelValues(field.width, field.height, 'images/cat/', teamOne.imgPixels);
    updatePixelValues(field.width, field.height, 'images/joker/', teamTwo.imgPixels);
    console.log(activeColor);

    getButtonFromDB();
    gatheringLiveUpdates();

    // throw login screen to user
    showLoginPopup();
}

function getRoundNumber() {
    var ref = database.ref('currentRound');
    ref.on('value', function(snapshot) {
        currentRound = snapshot.val();
    }, errData);
}

function getScore() {
    // var teamOneRef = database.ref('round/' + currentRound + '/score/teamOne');
    var teamOneRef = database.ref('round/score/teamOne');
    teamOneRef.on('value', function(data) {
        console.log('score t1', data.val());
        teamOne.score = data.val();
    }, errData);
    // var teamTwoRef = database.ref('round/' + currentRound + '/score/teamTwo');
    var teamTwoRef = database.ref('round/score/teamTwo');
    teamTwoRef.on('value', function(data) {
        console.log('score t2', data.val());
        teamTwo.score = data.val();
    }, errData);
}

function getServerTime() {
    var ref = database.ref('time');
    ref.on('value', function(snapshot) {
        serverTime = snapshot.val();
        console.log(serverTime);
    }, errData);
}

function getButtonFromDB() {
    // var buttonsPad = database.ref('colorButtons');
    if (team == 1) {
        var buttonsPad = database.ref('images/cat/palette');
    } else if (team == 2) {
        var buttonsPad = database.ref('images/joker/palette');
    }
    buttonsPad.on("value", gotButtonData, errButton);
}

function gotButtonData(data) {
    // clear previous list
    var buttonListings = selectAll('.buttonListing');
    for (var i = 0; i < buttonListings.length; i++) {
        buttonListings[i].remove();
    }
    var buttons = data.val();
    console.log(buttons);
    buttonKeys = Object.keys(buttons);
    console.log(buttonKeys);
    for (var i = 0; i < buttonKeys.length; i++) {
        // var k = buttonKeys[i];
        // console.log(k);
        var colorCode = buttons[i];
        colorArray[i] = colorCode;
        var buttonLi = createElement("li");
        buttonLi.parent("colorButtonListParent");
        var colorTag = colorCode.substr(1);
        var colorButton = createElement("button");
        buttonLi.child(colorButton);
        buttonLi.class('buttonListing');
        colorButton.id(colorTag);
        colorButton.style("background-color", colorCode);
        console.log(i, colorCode, colorTag);

        function makeColorClickHandler(color, key) {
            return function() {
                console.log(color, key);
                changeActiveColor(color, key)
            }
        }

        colorButton.mousePressed(makeColorClickHandler(colorCode, i));
        if (i == buttonKeys.length - 1) {
            changeActiveColorSetup(colorCode, key);
        }
    }
}

function errButton() {
    console.log("error retrieving button data!!")
}

function changeActiveColor(colorCode, key) {
    var colorTag = colorCode.substr(1);
    console.log(colorCode, colorTag, activeColor, activeColorIdentifier);
    var prevActiveColorButton = document.getElementById(activeColorIdentifier);
    var activeColorButton = document.getElementById(colorTag);

    prevActiveColorButton.className = "";
    console.log('key: ', key);
    activeColor = key;
    activeColorIdentifier = colorTag;
    activeColorButton.className = "activeColor";
}

function changeActiveColorSetup(colorCode, key) {
    var colorTag = colorCode.substr(1);
    var activeColorButton = document.getElementById(colorTag);

    activeColorIdentifier = colorTag;
    activeColor = key;
    activeColorButton.className = "activeColor";
}

function keyTyped(){
    if (key === '1') {
        activeColor = 0;
        changeActiveColorCss(1);
    } else if (key === '2'){
        activeColor = 1;
        changeActiveColorCss(2);
    } else if (key === '3'){
        activeColor = 2;
        changeActiveColorCss(3);
    } else if (key === '4'){
        activeColor = 3;
        changeActiveColorCss(4);
    } else if (key === '5'){
        activeColor = 4;
        changeActiveColorCss(5);
    } else if (key === '6'){
        activeColor = 5;
        changeActiveColorCss(6);
    } else if (key === '7'){
        activeColor = 6;
        changeActiveColorCss(7);
    } else if (key === '8'){
        activeColor = 7;
        changeActiveColorCss(8);
    }
}

function changeActiveColorCss(number){
    var mainDiv = document.getElementById('colorSelection');
    var x = mainDiv.children[0].children[number-1].children[0];

    for (var i = 0; i < 8; i++) {
         mainDiv.children[0].children[i].children[0].className = "";
    }

    x.className = "activeColor";
}

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

function drawGrid(width, height) {
    for (var col = 0; col < width / 20; col++) {
        for (var row = 0; row < height / 20; row++) {
            drawPixel(col, row, pixelValues, 20, 0, 0)
        }
    }
}

function drawPixel(col, row, arr, pixelSize, offsetX, offsetY) {
    // var color = arr[col][row];
    var color = colorArray[arr[col][row]];
    if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color)) {
        // console.log('valid colorvalue', color);
        noStroke();
        fill(color);
        rect(offsetX + col * pixelSize, offsetY + row * pixelSize, pixelSize, pixelSize);
    } else {
        console.log('invalid colorvalue', color);
    }
}

function drawScore() {
    var total = teamOne.score + teamTwo.score;
    if (total > 0) {
        var ratio = 800 / total;
        fill(204, 40, 34);
        rect(800, 0, 3, teamOne.score * ratio);
        fill(79, 42, 129);
        rect(800, 0 + teamOne.score * ratio, 3, teamTwo.score * ratio);
        // drawTeam(ratio, 810);
        // showCurrentLeader(ratio);
    }
}

function drawTeam(ratio, y) {
    fill('DimGray');
    textAlign('center');
    textStyle(BOLD);
    textSize(16);
    text(teamOne.score, y, 40 + teamOne.score / 2 * ratio);
    text(teamTwo.score, y, 40 + (teamOne.score + teamTwo.score / 2) * ratio);
}

function showCurrentLeader(ratio) {
    if (teamOne.score > teamTwo.score) {
        fill('DarkTurquoise');
        rect(840 - 8, 40, 3, teamOne.score * ratio);
    } else if (teamTwo.score > teamOne.score) {
        fill('GreenYellow');
        rect(840 - 8, 40 + teamOne.score * ratio, 3, teamTwo.score * ratio);
    } else {
        fill('DimGray');
        textAlign('LEFT');
        textStyle(BOLD);
        textSize(16);
        // text('TIED', 80 + (teamScore[0] + teamScore[1]) * ratio, 855);
        // text('TIED', 900, 405);
    }
}

function showReticle() {
    if (showSelector == false) {
        var x = floor(mouseX / 20) * 20;
        var y = floor(mouseY / 20) * 20;
        noFill();
        stroke(255, 100, 0);
        strokeWeight(1);

        if (keyIsDown(CONTROL) && specialAttack >= 0 && x > 20 && x < field.width - 20 && y > 20 && y < field.height - 20) {
            rect(x - 20, y - 20, 60, 60);
            fill(colorArray[activeColor]);
            noStroke();
            rect(x + 30, y - 30, 20, 20);
            textSize(16);
            textAlign(CENTER);
            fill('#EEE');
            text(specialAttack, x + 40, y - 16);
        } else if (x < field.width && y < field.height) {
            rect(x, y, 20, 20);
            fill(colorArray[activeColor]);
            // fill('Tomato');
            noStroke();
            rect(x + 10, y - 10, 20, 20);
        }
    }
}

function drawMinimap() {
    var x = floor(mouseX / 20) * 20;
    var y = floor(mouseY / 20) * 20;

    var scale = 4;
    // fill(255, 255, 255, .1);
    fill('rgba(150, 150, 150, 0.75)');
    noStroke();
    // rect(800, 0, 200, 200);
    // fill(255, 255, 255, 0);
    beginShape();
    // Exterior part of shape, clockwise winding
    vertex(820, 20);
    vertex(1020, 20);
    vertex(1020, 220);
    vertex(820, 220);
    if (keyIsDown(CONTROL) && specialAttack > 0 && x < field.width - 20 && x > 0 && y < field.height - 20 && y > 0) {
        // Interior part of shape, counter-clockwise winding
        beginContour();
        vertex(820 + x / scale - 5, 20 + y / scale - 5);
        vertex(820 + x / scale - 5, 20 + y / scale + 10);
        vertex(820 + x / scale + 10, 20 + y / scale + 10);
        vertex(820 + x / scale + 10, 20 + y / scale - 5);
        endContour();
        endShape(CLOSE);
        // rect(800 + x / scale - 5, y / scale - 5, 15, 15);
    } else if (x < field.width && y < field.height) {
        // Interior part of shape, counter-clockwise winding
        beginContour();
        vertex(820 + x / scale, 20 + y / scale);
        vertex(820 + x / scale, 20 + y / scale + 5);
        vertex(820 + x / scale + 5, 20 + y / scale + 5);
        vertex(820 + x / scale + 5, 20 + y / scale);
        endContour();
        endShape(CLOSE);
        // rect(800 + x / scale, y / scale, 5, 5);
    }
}

function mousePressed() {
    if (mouseButton == RIGHT && mouseX > 0 && mouseX < field.width && mouseY > 0 && mouseY < field.height) {
        lastClickedX = mouseX;
        lastClickedY = mouseY;
    }
    if (mouseX > 0 && mouseX < field.width && mouseY > 0 && mouseY < field.height) {
        changeColor();
    }
    if (mouseX > 840 && mouseX < 900 && mouseY > 840 && mouseY < 860) {
        if (loggedIn == false) {
            setToActive();
            console.log('Login succesful');
            loggedIn = true;
        } else {
            setToInactive();
            console.log('Logout succesful');
            loggedIn = false;
        }
    }
    if (mouseX > 840 && mouseX < 900 && mouseY > 760 && mouseY < 780) {
        if (readyToPlay == false) {
            console.log('Ready');
            readyToPlay = true;
        } else {
            console.log('Not Ready');
            readyToPlay = false;
        }
    }
    // console.log(floor(mouseX/20), floor(mouseY/20));
    return false;
}

function mouseDragged() {
    if (mouseButton == RIGHT && mouseX > 0 && mouseX < field.width && mouseY > 0 && mouseY < field.height) {
        showSelector = true;
    }
}

function mouseReleased() {
    if (mouseButton == RIGHT) {
        showSelector = false;
    }
}

function changeColor() {
    if (mouseX < 800 && mouseY < 800) {
        var x = floor(mouseX / 20);
        var y = floor(mouseY / 20);
        var ref = database.ref('pixels/' + x + '/' + y + '/color');
        ref.once('value', function(snapshot) {
            ref.set(activeColor);
        }, errData);

        if (keyIsDown(CONTROL) && specialAttack > 0) {
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    var ref = database.ref('pixels/' + (x - 1 + j) + '/' + (y - 1 + i) + '/color');
                    ref.once('value', function(snapshot) {
                        ref.set(activeColor);
                    }, errData);
                }
            }
            specialAttack--;
        }
    }
}

// function changeColor() {
//     if (mouseX < 800 && mouseY < 800) {
//         var x = floor(mouseX / 20);
//         var y = floor(mouseY / 20);
//         var ref = database.ref('requests/pixelChange/' + new Date().getTime());
//         drawPixel(x, y, pixelValues, 20, 0, 0);
//         ref.once('value', function(snapshot) {
//             data = {
//                 x: x,
//                 y: y,
//                 color: activeColor,
//                 sAttack: 0,
//                 user: localUserId || 'not yet logged in'
//             }
//             if (keyIsDown(CONTROL) && specialAttack > 0) {
//                 data.sAttack = 1;
//                 specialAttack--;
//             }
//             ref.set(data);
//         }, errData);
//     }
// }

function errData(err) {
    console.log("error");
    console.log(err);
}

function drawTimer() {
    var timer = document.getElementById('timer');
    timeDiff = floor(new Date().getTime() - serverTime);
    // timer.innerHTML = roundLength - floor(timeDiff / 1000);
    var barWidth = 800;
    var barHeight = 3;
    var width = barWidth / (roundLength * 1000);
    var padding = 0;
    if (timeDiff > (roundLength - 10) * 1000) {
        fill('Tomato');
    } else {
        fill('DimGray');
    }
    noStroke();
    if (timeDiff > (roundLength * 1000)) {
        fill('rgba(255, 255, 255, 0.75)');
        rect(0, 340, 800, 120);
        fill('DimGray');
        textAlign('center');
        textStyle(BOLD);
        textSize(16);
        text('The next game starts in: ' + (ceil(((roundLength + 10) * 1000 - timeDiff)/1000)) + ' seconds.', 400, 420);
    // } else if (timeDiff > (roundLength - 10) * 1000) {
    //     rect(padding + random(1, 5), 800 + random(1, 5), floor(timeDiff * width / 10) * 10, barHeight);
    } else {
        // rect(padding, 800, floor(timeDiff * width / 10) * 10, barHeight);
        rect(padding, 800, timeDiff * width, barHeight);
    }
}

function drawSelector() {
    var x = floor(lastClickedX / 20) * 20;
    var y = floor(lastClickedY / 20) * 20;
    var middleOfArray = floor((colorArray.length) / 2);
    if (showSelector) {
        fill(238);
        rect(x - 10 + 30 * (0 - middleOfArray), y - 50, 10 + ((colorArray.length) * 30), 40);
        for (var i = 0; i < colorArray.length; i++) {
            fill(colorArray[i]);
            if (mouseX > x + 30 * (i - middleOfArray) && mouseX < x + 30 + 30 * (i - middleOfArray) && mouseY > y - 40 && mouseY < y - 20) {
                strokeWeight(5);
                stroke(238);
            } else {
                noStroke();
            }
            rect(x + 30 * (i - middleOfArray), y - 40, 20, 20);
        }
    }
}

function getEndWinner(){
    var ref = database.ref('round/winner');
    ref.on('value', function(snapshot) {
        winner = snapshot.val();
    }, errData);
}

function drawWinner(){
    fill('DimGray');
    textAlign('CENTER');
    textStyle(BOLD);
    textSize(32);

   switch (winner) {
        case 1:
            text('End winner is team number 1!', 400, 400);
            break;
        case 2:
            text('End winner is team number 2!', 400, 400);
            break;
        case 3:
            text('Round draw...', 400, 400);
            break;
        default:
            break;
    }
}

function draw() {
    if ((activeColor === 0) == false && (activeColor == 0) == true) {
        activeColor = 7;
    }
    background(220);
    if (team == 1) {
        image(teamOne.img, 820, 20, 200, 200);
    } else if (team == 2) {
        image(teamTwo.img, 820, 20, 200, 200);
    }
    drawGrid(field.width, field.height);
    drawScore();
    showReticle();
    drawMinimap();
    drawTimer();
    drawSelector();
    // console.log(activeColor);
    drawWinner();
    getEndWinner();
}
