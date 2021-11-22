import React, { useEffect } from 'react';
import { Logout } from "../firebase";
import { auth} from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import '../styling/Settings.scss';
import { db } from '../firebase';
import {
    updateDoc,
    doc,
    deleteField
   } from '@firebase/firestore/lite';

const Settings = () => {
    const [user, loading, error] = useAuthState(auth);
    useEffect(() => {
        if (loading) {
            return;
        }
        if (error) {
            console.log('error', error);
        }
        if (user) {
            return;
        }
    }, [user, loading, error])
    
    const clearData = async () => {
        if (!window.confirm('Are you sure you want delete all your club data?')) {
            return;
        }
        localStorage.clear();
        await updateDoc(doc(db, 'users', user.uid), {
            allTimeStats: deleteField(),
            games: deleteField(),
            team: deleteField(),
            subs: deleteField()
        })
    }

    if (loading) {
        return <div className="page--settings">
            <p>Loading...</p>
        </div>
    }

    return <div className="page--settings">
        <button className="logout__btn" onClick={Logout}>
            Logout
        </button>
        <button className="clear__btn" onClick={() => clearData()}>
            Clear all club data
        </button>
    </div>
}

export default Settings;