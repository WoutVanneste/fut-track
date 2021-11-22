import React, { useEffect, useState } from 'react';
import { auth} from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs } from 'firebase/firestore/lite';
import { db, app } from '../firebase';
import {
    getFirestore,
   } from '@firebase/firestore/lite';

const TeamStats = () => {
    const [team, setTeam] = useState([]);
    const [teamLoading, setTeamLoading] = useState(false);
    const [user, loading, error] = useAuthState(auth);

    useEffect(() => {
        if (loading) {
            return;
        }
        if (user) {
            async function getTeamStats(db) {
            setTeamLoading(true);
            const firestore = getFirestore(app);
            const usersRef = collection(firestore, 'users');
            const usersSnapshot = await getDocs(usersRef);
            const teamsList = usersSnapshot.docs.map(doc => doc.data())[0];
            localStorage.setItem(`allTimePlayerStats-${user.uid}`, JSON.stringify(teamsList.allTimeStats))
            localStorage.setItem('allTimePlayerStatsUpdate', new Date().toString());
            setTeam(teamsList.allTimeStats);
            setTeamLoading(false);
            } 
            const date = new Date();
            const localDate = localStorage.getItem('allTimePlayerStatsUpdate');
            const millisecondsDiff = Math.abs(date.getTime() - new Date(localDate).getTime());
    
            // If 6 hours no update, do update 
            if (millisecondsDiff > 21600000) {
                getTeamStats(db);
            } else {
                if (localStorage.getItem(`allTimePlayerStats-${user.uid}`)) {
                    setTeam(JSON.parse(localStorage.getItem(`allTimePlayerStats-${user.uid}`)));
                }
            }
        }
    }, [user, loading]);

    const renderTeam = () => {
        const sortedTeam = team.sort((a, b) => {
            if (a.games === b.games) {
                if (a.goals === b.goals) {
                    return a.assists < b.assists ? 1 : -1
                }
                return a.goals < b.goals ? 1 : -1
             }
             return a.games < b.games ? 1 : -1;
        });
        const teamItems = sortedTeam.map((player, index) => (
            <li key={index} className="team__player__top">
                <img className="team__player--img" alt={player.name} src={player.image}/>
                <div className="team__player__right">
                    <p className="team__player--name">{player.name}</p>
                    <p className="team__player--info-text">{player.games} games - {player.goals} goals - {player.assists} assists</p>
                    <p className="team__player--info-text">{player.motms} MOTMs - {player.cleanSheets} clean sheets</p>
                </div>
            </li>
        ))
        return <div className="team__stats">{teamItems}</div>
    }

    if (loading || teamLoading) {
        return <p>Loading stats...</p>
    }

    return <div>
        {renderTeam()}
    </div>;
}

export default TeamStats;