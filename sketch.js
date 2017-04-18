var database;
var activeColor = 000000;
var activeColorIdentifier = "000000";
var verschillendeKleurButtonsReeks = ["FFFFFF", "C0C0C0", "808080", "000000", "FF0000", "800000", "FFFF00",
    "FF4500", "00FF00", "008000", "00FFFF", "008080", "0000FF", "000080", "FF00FF", "800080"
]; //eenmalig nodig voor Setup van firebase
var buttonKeys;
var field = {
    height: 500,
    width: 500
}

function setup() {
    var config = {
        apiKey: "AIzaSyDxXUxPThBPGK-t03hUQVYWUW2kixkNiPE",
        authDomain: "fir-draw-b22e0.firebaseapp.com",
        databaseURL: "https://fir-draw-b22e0.firebaseio.com",
        projectId: "fir-draw-b22e0",
        storageBucket: "fir-draw-b22e0.appspot.com",
        messagingSenderId: "1098200857569"
    };
    firebase.initializeApp(config);

    database = firebase.database();
    canvas = createCanvas(500, 500);
    canvas.parent("canvasParent");

    drawGrid();
    background(200);
    selecteerButtonsUitFirebase();
    // roodButton.mousePressed(selecteerKleur);
}

//--------------------Firebase database aanmaken setup code ----------////
function maakKleurButtonsFirebase(kleurReeks) {
    for (var i = 0; i < 16; i++) {
        maakKleurButtonFirebase(kleurReeks[i]);
    }
}

function maakKleurButtonFirebase(kleur) {
    var kleurButtons = database.ref('kleurButtons/' + kleur);
    var data = {
        active: 1,
        kleurCode: String(kleur)
    }
    kleurButtons.set(data);
    return kleur;
}

function selecteerButtonsUitFirebase() {
    var buttonsPad = database.ref('kleurButtons');

    buttonsPad.on("value", gotButtonData, errButton);
}

function gotButtonData(data) {
    // verwijderd data die er al stond
    var buttonListings = selectAll('.buttonListing');
    for (var i = 0; i < buttonListings.length; i++){
        buttonListings[i].remove();
    }
    //maakt van de data value een array
    var buttons = data.val();
    buttonKeys = Object.keys(buttons);
    //gaat array langs en voor iedere kleurCode waarde maakt hij een button aan
    for (var i = 0; i < buttonKeys.length; i++) {
        var k = buttonKeys[i];
        var kleurCode = buttons[k].kleurCode;
        // console.log(kleurCodes);
        var buttonLi = createElement("li");
        buttonLi.parent("colorButtonListParent");
        var kleurButton = createElement("button", kleurCode);
        buttonLi.child(kleurButton);
        buttonLi.class('buttonListing');
        kleurButton.id(kleurCode);
        kleurButton.style("background-color", kleurCode);
        console.log(i, kleurCode)


        function maakKleurKlikHandler(kleur) {
            return function() { veranderActiveKleur(kleur) }
        }

        kleurButton.mousePressed(maakKleurKlikHandler(kleurCode));
    }
}

function errButton() {
    console.log("error retrieving button data!!")
}
function veranderActiveKleur(kleurCode){
    var vorigeActiveKleurKnop = document.getElementById(activeColorIdentifier);
    var activeKleurKnop = document.getElementById(kleurCode);

    vorigeActiveKleurKnop.className = "";
    activeColor = "#" + kleurCode;
    activeColorIdentifier = kleurCode;
    activeKleurKnop.className = "activeKleur";
}

// // --------------------------- circle right click ui -------------------//
// function showCircleUi(){
//     if(mousePressed == true && mouseX < field.width && mouseY < field.height) {
//         console.log("Ja de muis is gedrukt in het canvas")
//     }
// }
//----------------------------------------------------------------------//
function maakVierkanten() {
    for (var j = 0; j < canvas.height / 100; j++) {
        var vierkantRij = database.ref('vierkanten/' + j);
        var data1 = {}
        vierkantRij.set(data1);
        for (var i = 0; i < canvas.width / 100; i++) {
            var vierkant = database.ref('vierkanten/' + j + '/' + i);
            var data2 = {
                kleur: 0
            }
            vierkant.set(data2);
        }
    }
}

// var value = 0;

function changeColor() {
    var x = floor(mouseX / 100);
    var y = floor(mouseY / 100);
    // console.log(x, y);
    var kleurWaardePad = database.ref('vierkanten/' + x + '/' + y + '/kleur');
    kleurWaardePad.transaction(function(data) {
        return data = activeColor;
    });

    // kleurWaardePad.set(100);
    // pixelColor[x][y] = (pixelColor[x][y] + 100) % 255;
}

function drawGrid() {
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            selecteerKleurUitFirebase(i, j);
        }
    }
}

function selecteerKleurUitFirebase(i, j) {
    var kleurWaardePad = database.ref('vierkanten/' + i + '/' + j + '/kleur');

    kleurWaardePad.on("value",
        function veranderKleur(data) {
            var kleurWaarde = data.val();
            noStroke();
            fill(kleurWaarde);
            rect(8 + (i * 98), 8 + (j * 98), 90, 90);
            text
        }, errKleur);
}

function errKleur() {
    console.log("error met kleur uit firebase halen.");
}

function mousePressed() {
    changeColor();

    //begin stukje code circle ui
    if(mouseButton == RIGHT && mouseX < field.width && mouseY < field.height) {
        console.log("Ja de muis is gedrukt in het canvas")
    }
}

function draw() {
}
