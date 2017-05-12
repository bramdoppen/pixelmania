var database;
var canvas;
var fr = 30;
var field = { width: 800, height: 800 }
var sameColor = 0;

function setup() {
    canvas = createCanvas(1000, 1000);
    canvas.parent('canvasContainer');

    database = firebase.database();
}

function initPixelsDB() {
    for (var i = 0; i < 800 / 20; i++) {
        for (var j = 0; j < 800 / 20; j++) {
            var ref = database.ref('pixels/' + i + '/' + j);
            var data = {
                color: 8
            }
            ref.set(data);
        }
    }
}

function convertColor() {
    for (var i = 0; i < 40; i++) {
        for (var j = 0; j < 40; j++) {
            var ref = database.ref('images/cat/' + i + '/' + j + '/color');
            ref.once('value', function(snapshot) {
                var color = snapshot.val();
                console.log(color);
                sameColor++;
                for (var k = 0; k < colorArray.length; k++) {
                    if (color === colorArray[k]) {
                        ref.set(k);
                    }
                    // console.log(color == colorArray[k]);
                }
                // console.log(sameColor);
            }, errData);
        }
    }
    console.log(colorArray);
}

function initTimerDB() {
    var currentTime = new Date().getTime();
    var time = database.ref('time');
    time.set(currentTime);
}

function draw() {
}
