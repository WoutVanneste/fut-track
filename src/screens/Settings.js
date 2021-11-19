import React from 'react';
import { Logout } from "../firebase";
import '../styling/Settings.scss';

const Settings = () => {
    return <div className="page--settings">
        <button className="logout__btn" onClick={Logout}>
            Logout
        </button>
    </div>
}

export default Settings;