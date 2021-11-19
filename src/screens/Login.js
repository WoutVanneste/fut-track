import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { auth, SignInWithGoogle, SignUserInWithEmailAndPassword } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import '../styling/Authentication.scss'; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      // maybe trigger a loading screen
      return;
    }
    if (error) {
      console.log('error man', error);
    }
    if (user) navigate("/home");
  }, [user, loading, error, navigate]);

  const SignIn = () => {
    SignUserInWithEmailAndPassword(email, password);
  }

  return (
  <div className="page--login">
      <div className="login__container">
        <input
          type="email"
          className="login__input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail Address"
        />
        <input
          type="password"
          className="login__input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button
          className="login__btn"
          onClick={SignIn}
        >
          Login
        </button>
        <button className="login__btn login__google" onClick={SignInWithGoogle}>
          Login with Google
        </button>
        <div>
          Don't have an account? <Link className="register__link" to="/register">Register</Link> now.
        </div>
      </div>
  </div>
  );
}

export default Login;