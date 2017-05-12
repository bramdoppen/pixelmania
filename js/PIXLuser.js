var database;

database = firebase.database();
var gathering = new Gathering(database, 'Pixelmania Room');

function gatheringLiveUpdates() {
    // Attach a callback function to track updates
    // That function will be called (with the user count and array of users) every time user list updated
    gathering.onUpdated(function(count, users) {
        console.log(gathering.roomName + ' have '+ count +' members.');
        console.log('Here is the updated users list -');
        for(var i in users) {
            console.log(users[i] + '(id: '+ i + ')');
        }
    });

}


var canvas;
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


function preload() {
    fontBold = loadFont('./assets/courbd.ttf');
}

function setup() {
    pixelDensity(1);
    frameRate(fr);
    textFont('Courier New');
    localTime = new Date().getTime();
    canvas = createCanvas(1000, 1000);
    canvas.parent('canvasContainer');



    getServerTime();
    getLoggedInUsers();

    getButtonFromDB();

    initializePixelValues(field.width, field.height);
    updatePixelValues(field.width, field.height);
    console.log(activeColor);

    getButtonFromDB();
    gatheringLiveUpdates();

    // throw login screen to user
    showLoginPopup();
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
        document.getElementById("logged-in-users").innerHTML += "<div id='" + data.key + "' class='user'><img src=' " + data.val().profile_picture + " '><p class='name'>" + data.val().username + "</p></div>";

    });
    usersInDb.on('child_removed', function(data) {
        console.log('removed ' + data.key, data.val().username);
        document.getElementById(data.key).remove();
    });
}

function getButtonFromDB() {
    // var buttonsPad = database.ref('colorButtons');
    var buttonsPad = database.ref('images/cat/palette');
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

function initializePixelValues(width, height) {
    for (var col = 0; col < width / 20; col++) {
        pixelValues.push([]);
        for (var row = 0; row < height / 20; row++) {
            pixelValues[col][row] = 8;
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
    var total = teamScore[0] + teamScore[1];
    var ratio = 720 / total;
    fill('DarkTurquoise');
    rect(840, 40, 20, teamScore[0] * ratio);
    fill('GreenYellow');
    rect(840, 40 + teamScore[0] * ratio, 20, teamScore[1] * ratio);
    drawTeam(ratio, 880);
    showCurrentLeader(ratio);
}

function drawTeam(ratio, y) {
    fill('DimGray');
    textAlign('center');
    textStyle(BOLD);
    textSize(16);
    text(teamScore[0], y, 40 + teamScore[0] / 2 * ratio);
    text(teamScore[1], y, 40 + (teamScore[0] + teamScore[1] / 2) * ratio);
}

function showCurrentLeader(ratio) {
    if (teamScore[0] > teamScore[1]) {
        fill('DarkTurquoise');
        rect(840 - 8, 40, 3, teamScore[0] * ratio);
    } else if (teamScore[1] > teamScore[0]) {
        fill('GreenYellow');
        rect(840 - 8, 40 + teamScore[0] * ratio, 3, teamScore[1] * ratio);
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
    console.log(floor(mouseX/20), floor(mouseY/20));
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

        if (keyIsDown(ALT) && specialAttack) {
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


function draw() {
    if ((activeColor === 0) == false && (activeColor == 0) == true) {
        activeColor = 7;
    }
    background(220);
    drawGrid(field.width, field.height);
    drawScore();
    showReticle();
    drawTimer();
    drawSelector();
    // console.log(activeColor);
}
