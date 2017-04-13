var database;
var mySound;
var canvas;
var fr = 60;
var nosound;

function preload() {
    mySound = loadSound('sfx/Input/Input-04a.mp3');
}

function setup() {
    pixelDensity(1);
    frameRate(fr);
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvasContainer');
    nosound = ceil(canvas.width / 20) * ceil(canvas.height / 20);
    console.log(nosound);

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

    background(255);
    drawGrid(canvas.width, canvas.height);
}

function changeColor() {
    if (mouseX < canvas.width && mouseY < canvas.height) {
        var x = floor(mouseX / 20);
        var y = floor(mouseY / 20);
        var ref = database.ref('pixels/' + x + '/' + y + '/color');
        ref.once('value', function(snapshot) {
            pixelcolor = snapshot.val();
            switch (pixelcolor) {
                case 255: ref.set(191); break;
                case 191: ref.set(127); break;
                case 127: ref.set(63); break;
                case 63: ref.set(0); break;
                case 0: ref.set(255); break;
                default: ref.set(255);
            }
        }, errData);
    }
}

function drawGrid(width, height) {
    for (var i = 0; i < width / 20; i++) {
        for (var j = 0; j < height / 20; j++) {
            drawPixel(i, j)
        }
    }
}

function drawPixel(i, j) {
    var ref = database.ref('pixels/' + i + '/' + j + '/color');
    ref.on('value', function(snapshot) {
        var color = snapshot.val();
        noStroke();
        fill(color);
        rect(i * 20, j * 20, 20, 20);
        if (nosound <= 0) {
            mySound.setVolume(0.05);
            mySound.play();
        }
        nosound--;
    }, errData);
}

function showReticle() {
    var x = floor(mouseX / 20) * 20;
    var y = floor(mouseY / 20) * 20;
    noFill();
    stroke(255, 100, 0);
    strokeWeight(1);
    rect(x, y, 20, 20);
}

function mousePressed() {
    if (mouseButton == LEFT) {
        changeColor();
    }
}

function createPixelsInDatabase() {
    for (var i = 0; i < 4000 / 20; i++) {
        for (var j = 0; j < 4000 / 20; j++) {
            var ref = database.ref('pixels/' + i + '/' + j);
            var data = {
                color: 255
            }
            ref.set(data);
        }
    }
}

function errData(err) {
    console.log("error");
    console.log(err);
}

function draw() {
    //    showReticle();
    // background(200);
    // camera(0, 0, 10);
    // plane(100,100);
}
