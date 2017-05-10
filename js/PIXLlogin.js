var provider = new firebase.auth.GoogleAuthProvider();
var localUserId;
function loginWithGoogle() {
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        localUserId = user.uid;
        console.log('userid ' + localUserId);
        // ...
        console.log(user);
        console.log(user.email);
        writeUserData(user.uid, user.displayName, user.email, user.photoURL);


    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        console.log(errorCode + errorMessage + email + credential);
    });
}

function signOutWithGoogle() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        console.log("signed out")
        removeUserData(localUserId);
        localUserId = "";
    }).catch(function(error) {
        // An error happened.
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

window.onload = function() {
    // initApp();
    


};