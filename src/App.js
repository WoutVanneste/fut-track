import {
  Routes,
  Route,
} from "react-router-dom";
import Home from './screens/Home';
import Team from './screens/Team';
import Settings from './screens/Settings';
import Games from './screens/Games';
import Login from "./screens/Login";
import Register from "./screens/Register";
import AuthWrapper from "./auth-wrapper";
import './App.scss';
import Navigation from "./components/Navigation";

function App() {
  return (
    <div>
     <Navigation />
      {/* A <Routes> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
      <Routes>
        <Route path="/team" element={<Team />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/games" element={<Games />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route exact path="/" element={<Login />} />
        <Route element={<AuthWrapper />} />
      </Routes>
    </div>
  );
}

export default App;
