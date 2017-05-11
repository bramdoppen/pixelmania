var database;
var canvas;
var fr = 30;
var field = { width: 800, height: 800 }

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

function initTimerDB() {
    var currentTime = new Date().getTime();
    var time = database.ref('time');
    time.set(currentTime);
}

function draw() {
}
