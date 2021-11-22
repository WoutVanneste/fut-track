import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, useNavigate } from "react-router-dom";
import {
  auth,
  RegisterUserWithEmailAndPassword,
  SignInWithGoogle,
} from "../firebase";
import '../styling/Authentication.scss'; 

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate();
    const register = () => {
    RegisterUserWithEmailAndPassword(email, password);
    };
    useEffect(() => {
      if (loading) {
        return;
      }
      if (error) {
        console.log('error', error);
      }
      if (user) navigate("/home");
    }, [user, loading, error, navigate]);
    return (
      <div className="page--register">
        <div className="register__container">
          <input
            type="text"
            className="register__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail Address"
          />
          <input
            type="password"
            className="register__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button className="register__btn" onClick={register}>
            Register
          </button>
          <button
            className="register__btn register__google"
            onClick={SignInWithGoogle}
          >
            Register with Google
          </button>
          <div>
            Already have an account? <Link className="login__link" to="/">Login</Link> now.
          </div>
        </div>
      </div>
    );
}

export default Register;