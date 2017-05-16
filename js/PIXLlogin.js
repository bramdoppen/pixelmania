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
        // document.getElementById("logged-in-users").innerHTML += "<div id='"+data.key+"' class='user'><img src=' "+ data.val().profile_picture +" '><p class='name'>"+ data.val().username +"</p></div>";

    });
    usersInDb.on('child_removed', function(data) {
        console.log('removed ' + data.key, data.val().username);
        // document.getElementById(data.key).remove();
    });
}

function showLoginPopup() {
    document.getElementById("mainOverlay").innerHTML = '<div class="innerContent"><h1>Klaar om te winnen?</h1><div class="buttonWrapper"><button onclick = "loginWithGoogle()">Inloggen met Google</button></div></div>';
    document.getElementById("mainOverlay").style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function removeLoginPopup() {
    document.getElementById("mainOverlay").style.display = 'none';
    document.body.style.overflow = 'auto';
}
