import React, { useEffect, useState } from 'react';
import { auth} from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore/lite';
import '../styling/Team.scss';

import {
    getFirestore,
    getDoc,
    updateDoc,
    setDoc,
    doc
   } from '@firebase/firestore/lite';
import TeamStats from '../components/Team-stats';


const Team = () => {
    const [playerSearch, setPlayerSearch] = useState("");
    const [subPlayerSearch, setSubPlayerSearch] = useState("");
    const [team, setTeam] = useState([]);
    const [subs, setSubs] = useState([]);
    const [teamHasGoalKeeper, setTeamHasGoalKeeper] = useState(false);
    const [players, setPlayers] = useState([]);
    const [initialPlayers, setInitialPlayers] = useState([]);
    const [user, loading, error] = useAuthState(auth);
    const [teamExists, setTeamExists] = useState(false);
    const [subsExists, setSubsExists] = useState(false);
    const [playersLoading, setPlayersLoading] = useState(false);
    const [showingStats, setShowingStats] = useState(false);

    useEffect(() => {
        if (loading) {
            return;
        }
        if (user) {
            if (localStorage.getItem(`${user.uid}-team`)) {
                setTeamExists(true);
                setTeamHasGoalKeeper(true);
                setTeam(JSON.parse(localStorage.getItem(`${user.uid}-team`)));
            }
            if (localStorage.getItem(`${user.uid}-subs`)) {
                setSubsExists(true);
                setSubs(JSON.parse(localStorage.getItem(`${user.uid}-subs`)));
            }
            if (localStorage.getItem('playerslist')) {
                setInitialPlayers(JSON.parse(localStorage.getItem('playerslist')));
                setPlayers(JSON.parse(localStorage.getItem('playerslist')));
            }
        }
    }, [loading, user])
    
    useEffect(() => {
        async function getPlayers(db) {
            setPlayersLoading(true);
            const playerCollection = collection(db, 'players');
            const playersSnapshot = await getDocs(playerCollection);
            const playersList = playersSnapshot.docs.map(doc => doc.data());
            setPlayers(playersList);
            setInitialPlayers(playersList);
            setPlayersLoading(false);
            localStorage.setItem('playerslist', JSON.stringify(playersList));
            localStorage.setItem('lastupdate', new Date().toString());
            const userCollection = collection(db, 'users');
            const docRef = await doc(userCollection, user.uid);
            const document = await getDoc(docRef);
            const docData = document.data();
            if (docData.team) {
                localStorage.setItem(`${user.uid}-team`, JSON.stringify(docData.team));
                setTeam(docData.team);
            }
            if (docData.subs) {
                localStorage.setItem(`${user.uid}-subs`, JSON.stringify(docData.subs));
                setSubs(docData.subs)
            }
        }
        const date = new Date();
        const localDate = localStorage.getItem('lastupdate');
        const millisecondsDiff = Math.abs(date.getTime() - new Date(localDate).getTime());

        // If 2 days no update, do update 
        if (user) {
            if (millisecondsDiff > 172800000) {
                getPlayers(db);
            }
        }
        
    }, [user])

    const saveTeam = async () => {
        if (loading) {
            // maybe trigger a loading screen
            return;
        }
        if (error) {
        console.log('error', error);
        }
        if (user) {
            setTeamExists(true);
            setSubsExists(true)
            team.forEach(player => {
                if (!player.goals) {
                    player.goals = 0;
                }
                if (!player.assists) {
                    player.assists = 0;
                }
                if (!player.motms) {
                    player.motms = 0;
                }
                if (!player.games) {
                    player.games = 0;
                }
                if (!player.cleanSheets) {
                    player.cleanSheets = 0;
                }
            })
            subs.forEach(player => {
                if (!player.goals) {
                    player.goals = 0;
                }
                if (!player.assists) {
                    player.assists = 0;
                }
                if (!player.motms) {
                    player.motms = 0;
                }
                if (!player.games) {
                    player.games = 0;
                }
                if (!player.cleanSheets) {
                    player.cleanSheets = 0;
                }
            })
            localStorage.setItem(`${user.uid}-team`, JSON.stringify(team));
            localStorage.setItem(`${user.uid}-subs`, JSON.stringify(subs));
                        
            await setDoc(doc(db, 'users', user.uid), {
                team: team,
                subs: subs
            })
            
        }
    }

    function containsObject(obj, list) {
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i] === obj) {
                return true;
            }
        }
        return false;
    }

    const addToTeam = player => {
        if (player.isGoalKeeper) {
            setTeamHasGoalKeeper(true);
        }
        const currentTeam = team;
        if (!containsObject(player, team)) {
            currentTeam.push(player);
            setTeam(currentTeam);
        }
    }

    const addToSubs = player => {
        const currentSubs = subs;
        if (!containsObject(player, subs)) {
            currentSubs.push(player);
            setSubs(currentSubs);
        }
    }

    const renderPlayers = () => {
        if (playersLoading) {
            return <p>loading...</p>
        }
        if (players && playerSearch !== "") {
            const sortedPlayers = players.sort((a,b)=> (a.rating < b.rating ? 1 : -1))
            const playerItems = sortedPlayers.map((player, index) => 
                <li className="search__player" key={index}>
                    <div className={player.isGoalKeeper ? "gk" : undefined}>
                        <img className="search__player--img" alt={player.name + " image"} src={player.image} />
                    </div>
                    <div className="search__player--info">
                        <p className="search__player--name">{player.name.length > 20 ? player.name.substring(0, 20) + "..." : player.name}</p>
                        <button className="team__btn search__player--add-btn" onClick={() => {
                            addToTeam(player);
                            setPlayerSearch("");
                        }}>Add to team</button>
                    </div>
                </li>
            )
            return <div className="search__player--results">{playerItems}</div>;
        }
    }

    const renderSubPlayers = () => {
        if (playersLoading) {
            return <p>loading...</p>
        }
        if (players && subPlayerSearch !== "") {
            const sortedPlayers = players.sort((a,b)=> (a.rating < b.rating ? 1 : -1))
            const playerItems = sortedPlayers.map((player, index) => 
                <li className="search__player" key={index}>
                    <div className={player.isGoalKeeper ? "gk" : undefined}>
                        <img className="search__player--img" alt={player.name + " image"} src={player.image} />
                    </div>
                    <div className="search__player--info">
                        <p className="search__player--name">{player.name.length > 20 ? player.name.substring(0, 20) + "..." : player.name}</p>
                        <button className="team__btn search__player--add-btn" onClick={() => {
                            addToSubs(player);
                            setSubPlayerSearch("");
                        }}>Add to subs</button>
                    </div>
                </li>
            )
            return <div className="search__player--results">{playerItems}</div>;
        }
    }

    const removeFromTeam = player => {
        const newTeam = team.filter(teamPlayer => teamPlayer.id !== player.id);
        setTeam(newTeam);
        setTeamExists(false);
        if (player.isGoalKeeper) {
            setTeamHasGoalKeeper(false);
        }
    }

    const removeFromSubs = player => {
        const newSubs = subs.filter(teamPlayer => teamPlayer.id !== player.id);
        setSubs(newSubs);
        setTeamExists(false);
    }

    const renderTeam = () => {
        let teamItems = null;
        if (team.length) {
            teamItems = team.map((teamPlayer, index) => 
            <li className="team__player" key={index}>
                <div className={teamPlayer.isGoalKeeper ? "gk" : undefined}>
                    <img className="team__player--img" alt={teamPlayer.name + " image"} src={teamPlayer.image} />
                </div>
                <div className="team__player--info">
                    <p className="team__player--name">{teamPlayer.name.length > 20 ? teamPlayer.name.substring(0, 20) + "..." : teamPlayer.name}</p>
                    <button className="team__btn team__player--remove-btn" onClick={() => removeFromTeam(teamPlayer)}>Remove</button>
                </div>
            </li>
        )
        }
        return <div className="team__player--results">{teamItems}</div>;
    }

    const renderSubs = () => {
        let teamItems = null;
        if (subs.length) {
            teamItems = subs.map((teamPlayer, index) => 
                <li className="team__player" key={index}>
                    <div className={teamPlayer.isGoalKeeper ? "gk" : undefined}>
                        <img className="team__player--img" alt={teamPlayer.name + " image"} src={teamPlayer.image} />
                    </div>
                    <div className="team__player--info">
                        <p className="team__player--name">{teamPlayer.name.length > 20 ? teamPlayer.name.substring(0, 20) + "..." : teamPlayer.name}</p>
                        <button className="team__btn team__player--remove-btn" onClick={() => removeFromSubs(teamPlayer)}>Remove</button>
                    </div>
                </li>
            )
        }
        return <div className="team__player--results">{teamItems}</div>;
    }

    const filterPlayers = (value) => {
        if (team.length === 10 && !teamHasGoalKeeper) {
            const inputFilteredPlayers = initialPlayers.filter(player => player.name.toLowerCase().includes(value.toLowerCase()));
            const onlyGoalKeepers = inputFilteredPlayers.filter(player => player.isGoalKeeper);
            return onlyGoalKeepers;
        } else {
            const inputFilteredPlayers = initialPlayers.filter(player => player.name.toLowerCase().includes(value.toLowerCase()));
            const teamExcludedPlayers = inputFilteredPlayers.filter(player => !containsObject(player, team));
            let goalKeeperFilteredPlayers = teamExcludedPlayers;
            if (teamHasGoalKeeper) {
                goalKeeperFilteredPlayers = teamExcludedPlayers.filter(player => !player.isGoalKeeper)
            }
            return goalKeeperFilteredPlayers;
        }
    }

    const renderTeamData = () => {
        return <div>
            {team.length === 10 && !teamHasGoalKeeper && <p className="team__select-message">Please select a goalkeeper for your team.</p>}
            {team.length < 11 ? 
            <div>
                <p>Select players for your team</p>
                <input
                    type="text"
                    className="player-search__input"
                    value={playerSearch}
                    onChange={(e) => {
                        setPlayerSearch(e.target.value)
                        const filteredPlayers = filterPlayers(e.target.value);
                        setPlayers(filteredPlayers);
                    }}
                    placeholder="Search team players"
                />
                {playerSearch.length > 0 ? renderPlayers() : null}
            </div> : 
            subs.length === 7 && <p>Great! You have 11 players in your team</p>}
            {team.length > 0 && <p>Current team:</p>}
            {renderTeam()}
            {subs.length < 7 ?
            <div>
                <p>Select players for your bench</p>
                <input
                    type="text"
                    className="player-search__input"
                    value={subPlayerSearch}
                    onChange={(e) => {
                        setSubPlayerSearch(e.target.value)
                        const filteredPlayers = filterPlayers(e.target.value);
                        setPlayers(filteredPlayers);
                    }}
                    placeholder="Search substitution players"
                />
                {subPlayerSearch.length > 0 ? renderSubPlayers() : null}
            </div> : team.length === 11 && null}
            {subs.length > 0 && <p>Current subs:</p>}
            {renderSubs()}
            {!teamExists || !subsExists ? <button className="save-team__btn" onClick={() => saveTeam()} disabled={team.length < 11}>Save team</button> : null}
        </div>
    }

    if (loading) {
        return <div className="page--team">
            <h1>Team</h1>
            <p>Loading team...</p>
        </div>
    }
    // return <p>lol</p>;
    return <div className="page--team">
        <div className="team__top">
        <h1>Team</h1>
        {!showingStats ?
            <button className="games__add-game-btn" onClick={() => {
                setShowingStats(true);
            }}>Show stats</button> :
            <button className="games__add-game-btn games__add-game-btn--remove" onClick={() => {
                setShowingStats(false);
            }}>x</button>}
        </div>
        {showingStats ? 
        <TeamStats /> : 
        renderTeamData()}
    </div>
}

export default Team;