// -------------------------------------------------------
// -------------------------------------------------------
// -------------------------------------------------------
// PIXLReferee - This handles all the requests
// -------------------------------------------------------
// -------------------------------------------------------


// -------------------------------------------------------
// Setup
// -------------------------------------------------------
var database;
var currentRound;
var pixelValues = [];
var localTime;
var serverTime;
var timeDiff;
var roundLength = 300;
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
    img: 'joker',
    imgPixels: []
}
var winnerAlreadySet = false;
var teamCounterSwitch = 0;

function preload() {
    fontBold = loadFont('assets/courbd.ttf');
}

function setup() {
    textFont('Courier New');
    localTime = new Date().getTime();
    database = firebase.database();
    getRoundNumber();
    getServerTime();
    pixelValues = initializePixelValues(field.width, field.height);
    teamOne.imgPixels = initializePixelValues(field.width, field.height);
    teamTwo.imgPixels = initializePixelValues(field.width, field.height);
    updatePixelValues(field.width, field.height, 'pixels/', pixelValues);
    updatePixelValues(field.width, field.height, 'images/cat/', teamOne.imgPixels);
    updatePixelValues(field.width, field.height, 'images/joker/', teamTwo.imgPixels);
    requestHandler();
    // teamRequestHandler();
}

function getRoundNumber() {
    var ref = database.ref('currentRound');
    ref.on('value', function(snapshot) {
        currentRound = snapshot.val();
    }, errData);
}

function getServerTime() {
    var ref = database.ref('time');
    ref.on('value', function(snapshot) {
        serverTime = snapshot.val();
        // console.log('A new round has started at', serverTime);
    }, errData);
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

function getScore(width, height) {
    teamOne.score = 0; teamTwo.score = 0;
    for (var col = 0; col < width / 20; col++) {
        for (var row = 0; row < height / 20; row++) {
            teamOne.score += countMatchingColors(col, row, teamOne);
            teamTwo.score += countMatchingColors(col, row, teamTwo);
        }
    }
    console.log('Team 1:', teamOne.score, 'Team 2:', teamTwo.score);
}

function countMatchingColors(col, row, team) {
    var matchingColor = false;
    if (team.imgPixels[col][row] === pixelValues[col][row] && team.imgPixels[col][row] != 8) {
        matchingColor = true;
    }
    if (matchingColor) {
        return 1;
    } else {
        return 0;
    }
}

function updateScore(score, team) {
    var ref = database.ref('round/score/' + team);
    ref.set(score);
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

function increaseRoundNumber() {
    var ref = database.ref('currentRound');
    currentRound++;
    ref.set(currentRound);
}

function setRoundWinner() {
    var ref = database.ref('round/winner');
    if(teamOne.score > teamTwo.score){
        ref.set(1);
    } else if (teamOne.score < teamTwo.score){
        ref.set(2);
    } else {
        ref.set(3);
    }
}

function gameLobby() {
    if (winnerAlreadySet == false) {
        setRoundWinner();
        winnerAlreadySet = true;
    }
    if (timeDiff >= (roundLength + 10) * 1000) {
        initRoundWinner();
        initTimerDB();
        initPixelsDB();
        winnerAlreadySet = false;
    }
}

// -------------------------------------------------------
// Requests
// -------------------------------------------------------


function requestHandler() {
    var ref = database.ref('requests/pixelChange');
    var validRequest = 0;
    ref.on('child_added', function(data) {
        var request = data.val();
        console.log('request by:', request.user, 'x:', request.x, 'y:', request.y, 'color:', request.color, 'sAttack:', request.sAttack);
        validRequest += checkForLegalRequest(request.x, 0, 39);
        validRequest += checkForLegalRequest(request.y, 0, 39);
        validRequest += checkForLegalRequest(request.color, 0, 7);
        validRequest += checkForLegalRequest(request.sAttack, 0, 1);
        // validRequest += checkIfValidUser(request.user);
        console.log('validRequest', validRequest == 0);
        if (validRequest === 0) {
            var ref = database.ref('pixels/' + request.x + '/' + request.y + '/color');
            ref.once('value', function(snapshot) {
                ref.set(request.color);
            }, errData);
            if (request.sAttack) {
                for (var i = 0; i < 3; i++) {
                    for (var j = 0; j < 3; j++) {
                        var ref = database.ref('pixels/' + (request.x - 1 + j) + '/' + (request.y - 1 + i) + '/color');
                        ref.once('value', function(snapshot) {
                            ref.set(request.color);
                        }, errData);
                    }
                }
            }
        } else {
            console.log('invalid request by:', request.user);
        }
        database.ref('requests/pixelChange').remove();
    }, errData);
}

function checkForLegalRequest(request, lowerLimit, upperLimit) {
    if (request >= lowerLimit && request <= upperLimit && typeof request === 'number' && (request % 1) === 0) {
        // console.log('legal request');
        return 0;
    } else {
        // console.log('illegal request');
        return 1;
    }
}

// -------------------------------------------------------
// Teams
// -------------------------------------------------------


// function teamRequestHandler() {
//     var ref = database.ref('requests/teamRequest');
//
//     ref.on('child_added', function(data) {
//         var request = data.val();
//         console.log('Team request added');
//         console.log('all', request);
//
//         var designatedTeam = chooseDesignatedTeam();
//
//         if(request.type == "add"){
//             var ref = database.ref('teams/' + designatedTeam + '/' + request.user);
//             ref.once('value', function(snapshot) {
//                 ref.set(request.user);
//                 console.log(request.user, ' toegevoegd aan team: ', designatedTeam);
//             }, errData);
//         } else if(request.type == "remove"){
//             database.ref('teams/team1/' + request.user).remove();
//             database.ref('teams/team2/' + request.user).remove();
//         }
//
//         database.ref('requests/teamRequest').remove();
//     }, errData);
// }
//
// function chooseDesignatedTeam() {
//     if(teamCounterSwitch == 0) {
//         teamCounterSwitch = 1;
//         return "team1"
//     } else {
//         teamCounterSwitch = 0;
//         return "team2"
//     }
// }
//
// //count keys in team functie wordt niet meer gebruikt
// function countKeysInTeam(team) {
//     var teamGrootte;
//
//     var ref = database.ref('teams/' + team);
//     ref.once('value', function(snapshot) {
//         var teamValue = snapshot.val();
//         var teamKeys = Object.keys(teamValue);
//
//         teamGrootte = teamKeys.length;
//         console.log(teamGrootte);
//     }, errData);
//
//     console.log(teamGrootte);
//     return teamGrootte;
// }

// -------------------------------------------------------
// Draw
// -------------------------------------------------------

function draw() {
    getScore(field.width, field.height);
    updateScore(teamOne.score, 'teamOne');
    updateScore(teamTwo.score, 'teamTwo');
    updateTimer();
}
