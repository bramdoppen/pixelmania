var database;
var mySound;
var canvas;
var pixelValues = [];
var prevPixelValues = [];
var prevField;
var readyToPlay = false;
var allPlayersReady = false;
var fr = 30;
var nosound;
var loggedIn = false;
var localTime;
var serverTime;
var timeDiff;
var currentActiveUsers = 0;
var gameStarted = false;
var roundLength = 600;
var usersReady = 0;
var field = {
    width: 800,
    height: 800
}
var teamScore = [0, 0, 0, 0];

var activeColor = 'White';
var activeColorIdentifier;

var showSelector = false;
var lastClickedX;
var lastClickedY;

var specialAttack = true;

var colorArray = ['DarkTurquoise', 'LightPink', 'GreenYellow', 'Peru', 'Tomato', 'MediumVioletRed', 'DimGray', 'White'];
var buttonKeys;

function preload() {
    fontBold = loadFont('./assets/courbd.ttf');
    mySound = loadSound('sfx/Input/Input-04a.mp3');
}

function setup() {
    pixelDensity(1);
    frameRate(fr);
    textFont('Courier New');
    // noCursor();
    localTime = new Date().getTime();
    canvas = createCanvas(1000, 1000);
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

    getServerTime();
    getLoggedInUsers();

    initializePixelValues(field.width, field.height);
    updatePixelValues(field.width, field.height);
    initializePrevPixelValues(field.width, field.height);
    updatePrevPixelValues(field.width, field.height);

    getButtonFromDB();
    usersLoggedIn();
}

function getServerTime() {
    var ref = database.ref('time');
    ref.on('value', function(snapshot) {
        serverTime = snapshot.val();
        console.log(serverTime);
    }, errData);
}
function getLoggedInUsers() {
    // var ref = database.ref('users');
    // ref.on('value', function(snapshot) {
    //     dbusers = snapshot.val();
    //     console.log('time' + dbusers);
    // }, errData);
    // firebase.database().ref('users/').on('value', function(snapshot) {
    //     snapshot.forEach(function(userSnapshot) {
    //         var username = userSnapshot.val();
    //         console.log('fromdb ' + username.profile_picture);
    //         // document.getElementById("logged-in-users").innerHTML = '<img src=" ' + username.profile_picture; + ' ">';
    //         document.getElementById("logged-in-users").innerHTML += "<div class='user'><img src=' "+ username.profile_picture +" '><p class='name'>"+ username.username +"</p></div>";
    //     });
    //
    // });
    var usersInDb = firebase.database().ref('users/');
    usersInDb.on('child_added', function(data) {
        console.log(data.key, data.val().username);
        document.getElementById("logged-in-users").innerHTML += "<div id='"+data.key+"' class='user'><img src=' "+ data.val().profile_picture +" '><p class='name'>"+ data.val().username +"</p></div>";

    });
    usersInDb.on('child_removed', function(data) {
        console.log('removed ' + data.key, data.val().username);
        document.getElementById(data.key).remove();
    });
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

    activeColorIdentifier = buttonKeys[buttonKeys.length - 1];
    activeColor = colorCode;
    activeColorButton.className = "activeColor";
}

function usersLoggedIn() {
    var ref = database.ref('activeUsers');
    ref.on('value', function(snapshot) {
        var activeUsers = snapshot.val();
        currentActiveUsers = activeUsers;
    }, errData);
}

function setToActive() {
    var ref = database.ref('activeUsers');
    ref.once('value', function(snapshot) {
        var activeUsers = snapshot.val();
        activeUsers = activeUsers + 1;
        ref.set(activeUsers);
        console.log('SET TO ACTIVE');
    }, errData);
}

function setToInactive() {
    var ref = database.ref('activeUsers');
    ref.once('value', function(snapshot) {
        var activeUsers = snapshot.val();
        activeUsers = activeUsers - 1;
        ref.set(activeUsers);
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

function initializePrevPixelValues(width, height) {
    for (var col = 0; col < width / 20; col++) {
        prevPixelValues.push([]);
        for (var row = 0; row < height / 20; row++) {
            prevPixelValues[col][row] = 255;
        }
    }
}

function updatePrevPixelValues(width, height) {
    for (var col = 0; col < width / 20; col++) {
        for (var row = 0; row < height / 20; row++) {
            getPrevPixelValue(col, row)
        }
    }
}

function getPrevPixelValue(col, row) {
    var ref = database.ref('prevField/' + col + '/' + row);
    ref.on('value', function(snapshot) {
        var colorValue = snapshot.val();
        prevPixelValues[col][row] = colorValue;
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
    var color = arr[col][row];
    noStroke();
    fill(color);
    rect(offsetX + col * pixelSize, offsetY + row * pixelSize, pixelSize, pixelSize);
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

function drawScore() {
    var total = teamScore[0] + teamScore[1] + teamScore[2] + teamScore[3];
    var ratio = 720 / total;
    fill('DarkTurquoise');
    rect(840, 40, 20, teamScore[0] * ratio);
    fill('GreenYellow');
    rect(840, 40 + teamScore[0] * ratio, 20, teamScore[1] * ratio);
    fill('Tomato');
    rect(840, 40 + (teamScore[0] + teamScore[1]) * ratio, 20, teamScore[2] * ratio);
    fill('MediumVioletRed');
    rect(840, 40 + (teamScore[0] + teamScore[1] + teamScore[2]) * ratio, 20, teamScore[3] * ratio);
    // drawTeam(ratio, 880);
    showCurrentLeader(ratio);
}

function drawTeam(ratio, y) {
    fill('DimGray');
    textAlign('center');
    textStyle(BOLD);
    textSize(16);
    text(teamScore[0], y, 40 + teamScore[0] / 2 * ratio);
    text(teamScore[1], y, 40 + (teamScore[0] + teamScore[1] / 2) * ratio);
    text(teamScore[2], y, 40 + (teamScore[0] + teamScore[1] + teamScore[2] / 2) * ratio);
    text(teamScore[3], y, 40 + (teamScore[0] + teamScore[1] + teamScore[2] + teamScore[3] / 2) * ratio);
}

function showCurrentLeader(ratio) {
    if (teamScore[0] > teamScore[1] && teamScore[0] > teamScore[2] && teamScore[0] > teamScore[3]) {
        fill('DarkTurquoise');
        rect(840 - 8, 40, 3, teamScore[0] * ratio);
    } else if (teamScore[1] > teamScore[0] && teamScore[1] > teamScore[2] && teamScore[1] > teamScore[3]) {
        fill('GreenYellow');
        rect(840 - 8, 40 + teamScore[0] * ratio, 3, teamScore[1] * ratio);
    } else if (teamScore[2] > teamScore[0] && teamScore[2] > teamScore[1] && teamScore[2] > teamScore[3]) {
        fill('Tomato');
        rect(840 - 8, 40 + (teamScore[0] + teamScore[1]) * ratio, 3, teamScore[2] * ratio);
    } else if (teamScore[3] > teamScore[0] && teamScore[3] > teamScore[1] && teamScore[3] > teamScore[2]) {
        fill('MediumVioletRed');
        rect(840 - 8, 40 + (teamScore[0] + teamScore[1] + teamScore[2]) * ratio, 3, teamScore[3] * ratio);
    } else {
        fill('DimGray');
        textAlign('LEFT');
        textStyle(BOLD);
        textSize(16);
        text('TIE', 80 + (teamScore[0] + teamScore[1] + teamScore[2] + teamScore[3]) * ratio, 855);
    }
}

function showReticle() {
    if (showSelector == false) {
        var x = floor(mouseX / 20)*20;
        var y = floor(mouseY / 20)*20;
        noFill();
        stroke(255, 100, 0);
        strokeWeight(1);

        if (keyIsDown(ALT) && specialAttack && x < field.width && y < field.height) {
            rect(x-20, y-20, 60, 60);
            fill(activeColor);
                if (activeColor == 'White') {
                    stroke(255, 100, 0);
                } else {
                    noStroke();
                }
            rect(x + 10, y - 10, 20, 20);
        } else if(x < field.width && y < field.height){
            rect(x, y, 20, 20);
            fill(activeColor);
                if (activeColor == 'White') {
                    stroke(255, 100, 0);
                } else {
                    noStroke();
                }
            rect(x + 10, y - 10, 20, 20);
        }
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
    if (mouseX > 840 && mouseX < 900 && mouseY > 840 && mouseY < 860 ) {
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
    if (mouseX > 840 && mouseX < 900 && mouseY > 760 && mouseY < 780 ) {
        if (readyToPlay == false) {
            console.log('Ready');
            readyToPlay = true;
        } else {
            console.log('Not Ready');
            readyToPlay = false;
        }
    }
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

        if(keyIsDown(ALT) && specialAttack){
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    var ref = database.ref('pixels/' + (x - 1 + j) + '/' + (y - 1 + i) + '/color');
                    ref.once('value', function(snapshot) {
                        ref.set(activeColor);
                    }, errData);
                }
            }
        }
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
        prevField = pixelValues;
        savePrevField();
        gameLobby();
    } else if (timeDiff <= roundLength * 1000) {
        timer.innerHTML = roundLength - floor(timeDiff / 1000);
    }
}

function savePrevField() {
    var ref = database.ref('prevField');
    ref.once('value', function(snapshot) {
        ref.set(pixelValues);
    }, errData);
}

function drawTimer() {
    var barWidth = 600;
    var width = barWidth / (roundLength * 1000);
    var padding = 100;
    if (timeDiff > (roundLength - 10) * 1000) {
        fill('Tomato');
    } else {
        fill('DimGray');
    }
    noStroke();
    if (timeDiff > (roundLength - 10) * 1000) {
        rect(padding + random(1, 5), 840 + random(1, 5), floor(timeDiff * width / 10) * 10, 20);
    } else {
        rect(padding, 840, floor(timeDiff * width / 10) * 10, 20);
    }
}

function drawPrevField(width, height) {
    for (var col = 0; col < width / 2; col++) {
        for (var row = 0; row < height / 2; row++) {
            drawPixel(col, row, prevPixelValues, 2, 920, 0)
        }
    }
}

function drawLoginandoutButton() {
    if (loggedIn == true) {
        fill('GreenYellow');
    } else {
        fill('Tomato');
    }
    noStroke();
    rect(840, 840, 60, 20);

    textSize(12);
    textAlign(CENTER);
    if (loggedIn == true) {
        fill('DimGray');
        text('logout', 870, 854);
    } else {
        fill('White');
        text('login', 870, 854);
    }
}

function drawReadyButton() {
    if (readyToPlay) {
        fill('GreenYellow');
    } else {
        fill('Tomato');
    }
    noStroke();
    rect(840, 760, 60, 20);

    textSize(12);
    textAlign(CENTER);
    if (readyToPlay) {
        fill('DimGray');
        text('not ready', 870, 774);
    } else {
        fill('White');
        text('ready', 870, 774);
    }
}

function drawActiveUsers() {
    noStroke();
    textSize(12);
    textAlign(CENTER);
    fill('DimGray');
    text('Logged in: ' + currentActiveUsers, 870, 100);
}

function drawWaitingScreen() {
    noStroke();
    textSize(24);
    textAlign(CENTER);
    fill('DimGray');
    rect(270, 370, 260, 40);
    fill('White');
    text('Start a new round', 400, 400);
}

function gameLobby() {
    initTimerDB();
    initPixelsDB();
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
            if (mouseX > x + 30 * (i - middleOfArray) && mouseX < x + 30 + 30 * (i - middleOfArray) && mouseY > y - 40 && mouseY < y - 20 ) {
                strokeWeight(5);
                stroke(238);
            } else {
                noStroke();
            }
            rect(x + 30 * (i - middleOfArray), y - 40, 20, 20);
        }
    }
}


function draw() {
    background(220);
    // background(255);
    // if (allPlayersReady) {
    drawGrid(field.width, field.height);
    updateScore(field.width, field.height);
    drawScore();
    // text(floor(frameRate()), 100, 100);
    showReticle();
    updateTimer();
    drawTimer();
    drawPrevField(80, 80);
    // } else {
    //     drawWaitingScreen();
    //     drawReadyButton();
    // }
    drawLoginandoutButton();
    drawActiveUsers();
    drawSelector();
}
