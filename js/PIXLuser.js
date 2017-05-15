var database;
database = firebase.database();
var gathering = new Gathering(database, 'Pixelmania Room');

var canvas;
var currentRound;
var pixelValues = [];
var fr = 30;
var localTime;
var serverTime;
var timeDiff;
var roundLength = 30;
var field = {
    width: 800,
    height: 800
}
var teamScore = [0, 0];
var team = 1;
var teamOne = {
    score: 0,
    img: '',
    imgName: 'cat',
    imgPixels: []
}
var teamTwo = {
    score: 0,
    img: '',
    imgName: 'firefox',
    imgPixels: []
}

var activeColor = 7;
var activeColorIdentifier;

var showSelector = false;
var lastClickedX;
var lastClickedY;

var specialAttack = true;

// var colorArray = ['DarkTurquoise', 'LightPink', 'GreenYellow', 'Peru', 'Tomato', 'MediumVioletRed', 'DimGray', 'White'];
// var colorArray = ['#026B99', '#028495', '#285E6F', '#603229', '#371D18', '#89756E', '#BBA69C', '#E8D6C1'];
var colorArray = [ '#EEE', '#EEE', '#EEE', '#EEE', '#EEE', '#EEE', '#EEE', '#EEE', '#EEE'];
var buttonKeys;
var winner;

function preload() {
    fontBold = loadFont('./assets/courbd.ttf');
    teamOne.img = loadImage('/assets/cat8c.jpg');
    teamTwo.img = loadImage('/assets/firefox8c.jpg');
}

function setup() {
    pixelDensity(1);
    frameRate(fr);
    textFont('Courier New');
    localTime = new Date().getTime();
    canvas = createCanvas(1200, 1000);
    canvas.parent('canvasContainer');

    getRoundNumber();
    getScore(teamOne, 'teamOne');
    getScore(teamTwo, 'teamTwo');
    getServerTime();
    getLoggedInUsers();

    getButtonFromDB();

    pixelValues = initializePixelValues(field.width, field.height);
    teamOne.imgPixels = initializePixelValues(field.width, field.height);
    teamTwo.imgPixels = initializePixelValues(field.width, field.height);
    // updatePixelValues(field.width, field.height, 'round/' + currentRound + '/pixels/', pixelValues);
    updatePixelValues(field.width, field.height, 'pixels/', pixelValues);
    updatePixelValues(field.width, field.height, 'images/cat/', teamOne.imgPixels);
    updatePixelValues(field.width, field.height, 'images/firefox/', teamTwo.imgPixels);
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

function getScore(team, name) {
    var ref = database.ref('round/' + currentRound + '/' + name);
    ref.on('value', function(snapshot) {
        team.score = snapshot.val();
    }, errData);
}

function getServerTime() {
    var ref = database.ref('time');
    ref.on('value', function(snapshot) {
        serverTime = snapshot.val();
        console.log(serverTime);
    }, errData);
}

function gatheringLiveUpdates() {
    // Attach a callback function to track updates
    // That function will be called (with the user count and array of users) every time user list updated
    gathering.onUpdated(function(count, users) {
        console.log(gathering.roomName + ' has '+ count +' member(s).');
        console.log('Here is the updated users list -');
        for(var i in users) {
            console.log(users[i] + '(id: '+ i + ')');
        }
    });
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
        document.getElementById("logged-in-users").innerHTML += "<div id='" + data.key + "' class='user'><img src=' " + data.val().profile_picture + " '><p class='name'>" + data.val().username + "</p></div>";

    });
    usersInDb.on('child_removed', function(data) {
        console.log('removed ' + data.key, data.val().username);
        document.getElementById(data.key).remove();
    });
}

function getButtonFromDB() {
    // var buttonsPad = database.ref('colorButtons');
    if (team == 1) {
        var buttonsPad = database.ref('images/cat/palette');
    } else if (team == 2) {
        var buttonsPad = database.ref('images/firefox/palette');
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
    // console.log(color);
    noStroke();
    fill(color);
    rect(offsetX + col * pixelSize, offsetY + row * pixelSize, pixelSize, pixelSize);
}

function drawScore() {
    var total = teamOne.score + teamTwo.score;
    var ratio = 720 / total;
    fill('DarkTurquoise');
    rect(840, 40, 20, teamOne.score * ratio);
    fill('Tomato');
    rect(840, 40 + teamOne.score * ratio, 20, teamTwo.score * ratio);
    drawTeam(ratio, 880);
    showCurrentLeader(ratio);
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
        text('TIED', 900, 405);
    }
}

function showReticle() {
    if (showSelector == false) {
        var x = floor(mouseX / 20) * 20;
        var y = floor(mouseY / 20) * 20;
        noFill();
        stroke(255, 100, 0);
        strokeWeight(1);

        if (keyIsDown(ALT) && specialAttack && x < field.width && y < field.height) {
            rect(x - 20, y - 20, 60, 60);
            fill(colorArray[activeColor]);
            noStroke();
            rect(x + 10, y - 10, 20, 20);
        } else if (x < field.width && y < field.height) {
            rect(x, y, 20, 20);
            fill(colorArray[activeColor]);
            // fill('Tomato');
            noStroke();
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
        // changeColor();
        changeColorNew();
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

// function changeColor() {
//     if (mouseX < 800 && mouseY < 800) {
//         var x = floor(mouseX / 20);
//         var y = floor(mouseY / 20);
//         var ref = database.ref('pixels/' + x + '/' + y + '/color');
//         ref.once('value', function(snapshot) {
//             ref.set(activeColor);
//         }, errData);
//
//         if (keyIsDown(ALT) && specialAttack) {
//             for (var i = 0; i < 3; i++) {
//                 for (var j = 0; j < 3; j++) {
//                     var ref = database.ref('pixels/' + (x - 1 + j) + '/' + (y - 1 + i) + '/color');
//                     ref.once('value', function(snapshot) {
//                         ref.set(activeColor);
//                     }, errData);
//                 }
//             }
//         }
//     }
// }

function changeColorNew() {
    if (mouseX < 800 && mouseY < 800) {
        var x = floor(mouseX / 20);
        var y = floor(mouseY / 20);
        var ref = database.ref('requests/pixelChange/' + new Date().getTime());
        ref.once('value', function(snapshot) {
            data = {
                x: x,
                y: y,
                color: activeColor,
                sAttack: 0,
                user: localUserId
            }
            ref.set(data);
        }, errData);

        if (keyIsDown(ALT) && specialAttack) {
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    var ref = database.ref('requests/pixelChange/' + new Date().getTime());
                    ref.once('value', function(snapshot) {
                        data = {
                            x: x - 1 + j,
                            y: y - 1 + i,
                            color: activeColor,
                            sAttack: 1,
                            user: localUserId
                        }
                        ref.set(data);
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

function drawTimer() {
    var timer = document.getElementById('timer');
    timeDiff = floor(new Date().getTime() - serverTime);
    timer.innerHTML = roundLength - floor(timeDiff / 1000);
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
    var ref = database.ref('round/' + currentRound + '/winner');
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
            text('End winner is team number 1!', 120, 400);
            break;
        case 2:
            text('End winner is team number 2!', 120, 400);
            break;
        case 3:
            text('Round draw...', 120, 400);
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
    // image(teamOne.img, 800, 0, 400, 400);
    drawGrid(field.width, field.height);
    // drawScore();
    showReticle();
    drawTimer();
    drawSelector();
    // console.log(activeColor);
    drawWinner();
    getEndWinner();
}
