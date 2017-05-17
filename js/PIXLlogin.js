// -------------------------------------------------------
// Google sign-in
// -------------------------------------------------------

var provider = new firebase.auth.GoogleAuthProvider();
var localUserId;

function loginWithGoogle() {
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        localUserId = user.uid;

        // remove the login popup when login is succesful
        removeLoginPopup();
        requestTeamAdd();

        // add user to the gathering
        gathering.join(localUserId, user.displayName);

        // write user data to the database
        writeUserData(user.uid, user.displayName, user.email, user.photoURL);


    }).catch(function(error) {
        // Handle Errors here.
        var errorMessage = error.message;
        console.log(errorMessage);
    });
}

function signOutWithGoogle() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        removeUserData(localUserId);
        localUserId = "";
    }).catch(function(error) {
        console.log(error)
    });
}

function writeUserData(uid, name, email, imageUrl) {
    var userid = database.ref('users/' + uid);
    userid.set({
        username: name,
        email: email,
        profile_picture : imageUrl
    });
}

function removeUserData(uid) {
    var loggedInUser = database.ref('users/' + uid);
    loggedInUser.remove();
}

function getLoggedInUsers() {
    var usersInDb = firebase.database().ref('users/');
    usersInDb.on('child_added', function(data) {
        console.log(data.key, data.val().username);
    });
    usersInDb.on('child_removed', function(data) {
        console.log('removed ' + data.key, data.val().username);
    });
}

// -------------------------------------------------------
// Login popup
// -------------------------------------------------------

function showLoginPopup() {
    document.getElementById("mainOverlay").innerHTML = '<div class="innerContent"><div class="buttonWrapper"><button id="loginButton" onclick = "loginWithGoogle()">Play</button></div></div>';
    document.getElementById("mainOverlay").style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function removeLoginPopup() {
    document.getElementById("mainOverlay").style.display = 'none';
    document.body.style.overflow = 'auto';
}

// -------------------------------------------------------
// Team requests
// -------------------------------------------------------
function requestTeamAdd(){
    var ref = database.ref('requests/teamRequest/' + new Date().getTime());
    ref.once('value', function(snapshot) {
        data = {
            user: localUserId,
            type: "add"
        }
        ref.set(data);
    }, errData);
}

function requestTeamRemove(){
    var ref = database.ref('requests/teamRequest/' + new Date().getTime());
    ref.once('value', function(snapshot) {
        data = {
            user: localUserId,
            type: "remove"
        }
        ref.set(data);
    }, errData);
}

// -------------------------------------------------------
// Gathering.js functions
// -------------------------------------------------------

function getUserPhotoFromDatabase(userid) {
    var getPhoto = database.ref('users/'+ userid + '/profile_picture');
    var gatheringProfilePhoto = "";
    getPhoto.once('value', function(snapshot) {
        gatheringProfilePhoto = snapshot.val();
    }, errData);
    return gatheringProfilePhoto;
}


function gatheringLiveUpdates() {
    // Attach a callback function to track updates
    // That function will be called (with the user count and array of users) every time user list updated
    gathering.onUpdated(function(count, users) {
        console.log(gathering.roomName + ' has '+ count +' member(s).');

        // empty the whole 'logged in users' field.
        document.getElementById("logged-in-users").innerHTML = "";

        for(var i in users) {
            // document.getElementById("logged-in-users").innerHTML += "<div id='"+ i +"' class='user'><img src='"+getUserPhotoFromDatabase(i)+ "'><p class='name'>"+ users[i] +"</p></div>";
            document.getElementById("logged-in-users").innerHTML += "<div id='"+ i +"' class='user'><img src='"+getUserPhotoFromDatabase(i)+ "'></div>";
        }
    });
}
