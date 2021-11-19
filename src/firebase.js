import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "firebase/auth";
import { getFirestore } from 'firebase/firestore/lite';



// import { auth} from 'firebase/auth/dist';
const firebaseConfig = {
    apiKey: "AIzaSyDwq61q8s4J4r95WdaGGJbrpo0YvarYxz4",
    authDomain: "fut-track-3f312.firebaseapp.com",
    databaseURL: "https://fut-track-3f312-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "fut-track-3f312",
    storageBucket: "fut-track-3f312.appspot.com",
    messagingSenderId: "485590774951",
    appId: "1:485590774951:web:75d5521e9ef6aee892d782",
    measurementId: "G-GVSNZJL0E4"
  };
const app = initializeApp(firebaseConfig);

const auth = getAuth();

const db = getFirestore(app);

const RegisterUserWithEmailAndPassword = (email, password) => {
  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    console.log('user', user);
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    console.log('errorCode', errorCode);
    const errorMessage = error.message;
    console.log('errorMessage', errorMessage);
    // ..
  });
}

const SignUserInWithEmailAndPassword = (email, password) => {
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    console.log('user', user);
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    console.log('errorCode', errorCode);
    const errorMessage = error.message;
    console.log('errorMessage', errorMessage);
  });
} 

const SignInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    console.log('token', token);
    // The signed-in user info.
    const user = result.user;
    console.log('user', user);
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    console.log('errorCode', errorCode);
    const errorMessage = error.message;
    console.log('errorMessage', errorMessage);
    // The email of the user's account used.
    const email = error.email;
    console.log('email', email);
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    console.log('credential', credential);
    // ...
  });
}

const Logout = () => {
  signOut(auth).then(() => {
    // Sign-out successful.
  }).catch((error) => {
    // An error happened.
    console.log('error', error);
  });
}

export {
  auth,
  db,
  RegisterUserWithEmailAndPassword,
  SignUserInWithEmailAndPassword,
  SignInWithGoogle,
  Logout
};