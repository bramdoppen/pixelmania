var provider = new firebase.auth.GoogleAuthProvider();
var username = "";

function googleSignin() {
    firebase.auth()

    .signInWithPopup(provider).then(function(result) {
        var token = result.credential.accessToken;
        var user = result.user;

        username = user.displayName;
        document.getElementById("login_username").innerHTML = username;

        console.log(token);
        console.log(username);
    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;

        console.log(error.code);
        console.log(error.message);
    });

}

function googleSignout() {
    firebase.auth().signOut()

        .then(function() {
            console.log('Signout Succesfull');
        }, function(error) {
            console.log('Signout Failed');
        });
}

function initApp() {
    // Auth state changes.
    // [START authstatelistener]
    firebase.auth().onAuthStateChanged(function(user){
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;

        } else {
        }
    });
}
window.onload = function() {
    initApp();
};
