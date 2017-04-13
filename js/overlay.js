var canvas;
var fr = 60;

function setup() {
    pixelDensity(1);
    frameRate(fr);
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvasContainer');
}

function showReticle() {
    var x = floor(mouseX / 20) * 20;
    var y = floor(mouseY / 20) * 20;
    noFill();
    stroke(255, 100, 0);
    strokeWeight(1);
    rect(x, y, 20, 20);
}

function draw() {
    // background(200);
    showReticle();
    // camera(0, 0, 10);
    // plane(100,100);
}
