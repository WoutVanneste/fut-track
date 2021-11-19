import { useEffect } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router";
import { useLocation  } from "react-router-dom";
import { auth } from "./firebase";

const AuthWrapper = ({children}) => {
    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate();
    const location = useLocation();

      useEffect(() => {
        if (loading) {
            // maybe trigger a loading screen
            return;
        }
        if (error) {
        console.log('error', error);
        }
        if (!location.pathname.includes("register") && !location.pathname.includes("login")) {
            if (!user) navigate("/");
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [user, loading, error, navigate]);
    return children;
}

export default AuthWrapper;