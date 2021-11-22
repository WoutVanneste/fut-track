import React, { useEffect, useState } from 'react';
import { auth} from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const TeamStats = () => {
    const [team, setTeam] = useState([]);
    const [user, loading, error] = useAuthState(auth);

    useEffect(() => {
        if (loading) {
            return;
        }
        if (user) {
            if (localStorage.getItem(`allTimePlayerStats-${user.uid}`)) {
                setTeam(JSON.parse(localStorage.getItem(`allTimePlayerStats-${user.uid}`)));
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

    return <div>
        {renderTeam()}
    </div>;
}

export default TeamStats;