var currentRound = 1;

var teamImage1 = "tesla";
var teamImage2 = "firefox";

var imageValues = [];

initializeImageValues(field.width, field.height);

// chooseWinner(
//     updateImageValues(field.width, field.height, teamImage1),
//     updateImageValues(field.width, field.height, teamImage2),
//     pixelValues
// );

// compareImageArrays(updateImageValues(field.width, field.height, "firefox"), pixelValues)

function compareImageArrays(array1, array2) {
    var points = 0;
    var arrayTotalCount = 0;

    for (var i = 0; i < array2.length; i++) {
        for (var j = 0; j < array2[i].length; j++) {
            if (array1[i][j] == array2[i][j]) {
                points++;
            }
        }
    }

    arrayTotalCount = array2.length * array2[0].length;
    printScoreOfTotal(points, arrayTotalCount);

    return points;
}

function printScoreOfTotal(points, arrayTotalCount) {
    console.log(points, " / ", arrayTotalCount);
}

function setRoundWinner(winnerTeam) {
    var ref = database.ref('/previousRounds/' + currentRound + '/conclusion/winner');
    ref.once('value', function(snapshot) {
        ref.set(winnerTeam);
    }, errData);
}

function chooseWinner(pictureArrayTeam1, pictureArrayTeam2, canvasArray) {
    var winner;
    var team1 = compareImageArrays(canvasArray, pictureArrayTeam1);
    var team2 = compareImageArrays(canvasArray, pictureArrayTeam2);

    if (team1 > team2) {
        winner = 1;
        console.log("Team 1 heeft gewonnen!");
    } else if (team1 < team2) {
        winner = 2;
        console.log("Team 2 heeft gewonnen!");
    } else {
        winner = 3;
        console.log("Gelijkspel!");
    }
    setRoundWinner(winner);
    return winner;
}

function compareTeamImagesToCanvas(imageTeam1, imageTeam2, canvas){
    updateImageValues(field.width, field.height, imageTeam1);
}

function initializeImageValues(width, height) {
    for (var col = 0; col < width / 20; col++) {
        imageValues.push([]);
        for (var row = 0; row < height / 20; row++) {
            imageValues[col][row] = 255;
        }
    }
}

function updateImageValues(width, height, image){
    for (var col = 0; col < width / 20; col++) {
        for (var row = 0; row < height / 20; row++) {
            getImageValue(col, row, image);
        }
    }

    return imageValues;
}

function getImageValue(col, row, image) {
    var ref = database.ref('images/' + image + '/' + col + '/' + row + '/color');
    ref.on('value', function(snapshot) {
        var colorValue = snapshot.val();
        imageValues[col][row] = colorValue;
    }, errData);
}
