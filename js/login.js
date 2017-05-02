var provider = new firebase.auth.GoogleAuthProvider();
var username, photo;

function loginWithGoogle() {
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
        console.log(user.displayName);
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
    }).catch(function(error) {
        // An error happened.
        console.log("error out")
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


window.onload = function() {
    // initApp();
};