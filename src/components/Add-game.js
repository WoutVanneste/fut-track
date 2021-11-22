import React, { useEffect, useState } from 'react';
import { auth} from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import '../styling/Games.scss';
import { db } from '../firebase';
import { collection } from 'firebase/firestore/lite';
import {
    getDoc,
    updateDoc,
    doc
   } from '@firebase/firestore/lite';

const AddGames = ({saveGame}) => {
    const [motm, setMotm] = useState(0);
    const [user, loading, error] = useAuthState(auth);
    const [team, setTeam] = useState([]);
    const [subs, setSubs] = useState([]);
    const [awayGoals, setAwayGoals] = useState(0);
    const [totalGoals, setTotalGoals] = useState(0);
    const [totalAssists, setTotalAssists] = useState(0);
    const [totalActiveSubs, setTotalActiveSubs] = useState(0);
    const [gamesLoading, setGamesLoading] = useState(false);

    useEffect(() => {
        if (loading) {
            return;
        }
        if (error) {
            console.log('error', error);
        }
        if (user) {
            if (localStorage.getItem(`${user.uid}-team`)) {
                setTeam(JSON.parse(localStorage.getItem(`${user.uid}-team`)));
            }
            if (localStorage.getItem(`${user.uid}-subs`)) {
                setSubs(JSON.parse(localStorage.getItem(`${user.uid}-subs`)));
            }
        }
    }, [user, loading, error])

    useEffect(() => {
        if (user) {
            async function getGames(db) {
                setGamesLoading(true);
                localStorage.setItem('allTimeGamesUpdate', new Date().toString());
                const userCollection = collection(db, 'users');
                const docRef = await doc(userCollection, user.uid);
                const document = await getDoc(docRef);
                const docData = document.data();
                if (docData.games) {
                    localStorage.setItem(`allTimeGames-${user.uid}`, JSON.stringify(docData.games));
                }
                setGamesLoading(false);
            }
            const date = new Date();
            const localDate = localStorage.getItem('allTimeGamesUpdate');
            const millisecondsDiff = Math.abs(date.getTime() - new Date(localDate).getTime());

            // If 2 days no update, do update 
            if (millisecondsDiff > 172800000) {
                getGames(db);
            }
        }
        
    }, [user])
    

    const addTeamGoal = player => {
        const newTeam = [...team];
        const index = newTeam.findIndex((teamPlayer) => teamPlayer.id === player.id);
        if (newTeam[index].goals) {
            newTeam[index].goals += 1;
        } else {
            newTeam[index].goals = 1;
        }
        setTeam(newTeam);
        const newTotalGoals = totalGoals + 1;
        setTotalGoals(newTotalGoals);
    }

    const addTeamAssist = player => {
        const newTeam = [...team];
        const index = newTeam.findIndex((teamPlayer) => teamPlayer.id === player.id);
        if (newTeam[index].assists) {
            newTeam[index].assists += 1;
        } else {
            newTeam[index].assists = 1;
        }
        setTeam(newTeam);
        const newTotalAssists = totalAssists + 1;
        setTotalAssists(newTotalAssists);
    }

    const addSubGoal = player => {
        const newSubs = [...subs];
        const index = newSubs.findIndex((teamPlayer) => teamPlayer.id === player.id);
        if (totalActiveSubs < 3) {
            newSubs[index].active = true;
            if (newSubs[index].goals) {
                newSubs[index].goals += 1;
            } else {
                newSubs[index].goals = 1;
            }
            setTotalActiveSubs(totalActiveSubs + 1);
            setSubs(newSubs);
        } else if (newSubs[index].active) {
            if (newSubs[index].goals) {
                newSubs[index].goals += 1;
            } else {
                newSubs[index].goals = 1;
            }
            const newTotalGoals = totalGoals + 1;
            setTotalGoals(newTotalGoals);
            setSubs(newSubs);
        }
    }
    
    const addSubAssist = player => {
        const newSubs = [...subs];
        const index = newSubs.findIndex((teamPlayer) => teamPlayer.id === player.id);
        if (totalActiveSubs < 3) {
            newSubs[index].active = true;
            setTotalActiveSubs(totalActiveSubs + 1);
            if (newSubs[index].assists) {
                newSubs[index].assists += 1;
            } else {
                newSubs[index].assists = 1;
            }
            const newTotalAssists = totalAssists + 1;
            setTotalAssists(newTotalAssists);
            setSubs(newSubs);
        } else if (newSubs[index].active) {
            if (newSubs[index].assists) {
                newSubs[index].assists += 1;
            } else {
                newSubs[index].assists = 1;
            }
            const newTotalAssists = totalAssists + 1;
            setTotalAssists(newTotalAssists);
            setSubs(newSubs);
        }
        
    }
    
    const makeSubMotm = (player) => {
        const newSubs = [...subs];
        const index = newSubs.findIndex((teamPlayer) => teamPlayer.id === player.id);
        if (totalActiveSubs < 3) {
            newSubs[index].active = true;
            setTotalActiveSubs(totalActiveSubs + 1);
            setMotm(player.id);
            setSubs(newSubs);
        } else if (newSubs[index].active){
            setMotm(player.id);
        }
    }

    const setPlayerActive = player => {
        const newSubs = [...subs];
        const index = newSubs.findIndex((teamPlayer) => teamPlayer.id === player.id);
        const newActiveState = !newSubs[index].active;
        if (newActiveState) {
            if (totalActiveSubs < 3) {
                newSubs[index].active = true;
                setTotalActiveSubs(totalActiveSubs + 1);
            }
        } else {
            newSubs[index].active = false;
            setTotalActiveSubs(totalActiveSubs - 1);
        }
        setSubs(newSubs);
    }

    const clearGoalsAssists = player => {
        const newTeam = [...team];
        const index = newTeam.findIndex((teamPlayer) => teamPlayer.id === player.id);
        const newTotalGoals = totalGoals - newTeam[index].goals;
        setTotalGoals(newTotalGoals);
        const newTotalAssists = totalGoals - newTeam[index].assists;
        setTotalAssists(newTotalAssists);
        newTeam[index].assists = 0;
        newTeam[index].goals = 0;
        setTeam(newTeam);
    }

    const clearGoalsAssistsSubs = player => {
        const newSubs = [...subs];
        const index = newSubs.findIndex((teamPlayer) => teamPlayer.id === player.id);
        const newTotalGoals = totalGoals - newSubs[index].goals;
        setTotalGoals(newTotalGoals);
        const newTotalAssists = totalAssists - newSubs[index].assists;
        setTotalAssists(newTotalAssists);
        newSubs[index].assists = 0;
        newSubs[index].goals = 0;
        if (motm !== player.id) {
            newSubs[index].active = false;
            setTotalActiveSubs(totalActiveSubs - 1);
        }
        setSubs(newSubs);

    }

    const renderTeam = () => {
        const teamItems = team.map((teamPlayer, index) => 
            <li className="games__player" key={index}>
                <div className={teamPlayer.isGoalKeeper ? "gk" : undefined}>
                    <img className={`games__player--img ${motm === teamPlayer.id ? "motm" : undefined}`} alt={teamPlayer.name + " image"} src={teamPlayer.image} />
                </div>
                <div className="games__player--info">
                    <p className="games__player--name">{teamPlayer.name.length > 20 ? teamPlayer.name.substring(0, 20) + "..." : teamPlayer.name}</p>
                    <button className={`games__clear-btn ${teamPlayer.goals > 0 || teamPlayer.assists > 0 ? "active" : undefined}`} onClick={() => clearGoalsAssists(teamPlayer)}>x</button>
                    <button className="games__btn games__player--stats-btn" onClick={() => addTeamGoal(teamPlayer)}>{teamPlayer.goals > 0 ? teamPlayer.goals : "G"}</button>
                    <button className="games__btn games__player--stats-btn" onClick={() => addTeamAssist(teamPlayer)}>{teamPlayer.assists > 0 ? teamPlayer.assists : "A"}</button>
                    <button className={`games__motm-btn ${motm === teamPlayer.id ? "active" : undefined}`} onClick={() => {
                        setMotm(teamPlayer.id);
                    }}></button>
                </div>
            </li>
        )
        return <div className="games__player--results">{teamItems}</div>;
    }

    const renderSubs = () => {
        const teamItems = subs.map((teamPlayer, index) => 
        <li className={`games__player games__player--sub ${teamPlayer.active && "active"}`} key={index}>
            <div className={teamPlayer.isGoalKeeper ? "gk" : undefined}>
                <img onClick={() => setPlayerActive(teamPlayer)}  className={`games__player--img games__player--img--sub ${motm === teamPlayer.id ? "motm" : undefined}`} alt={teamPlayer.name + " image"} src={teamPlayer.image} />
            </div>
            <div className="games__player--info">
                <p className="games__player--name">{teamPlayer.name.length > 20 ? teamPlayer.name.substring(0, 20) + "..." : teamPlayer.name}</p>
                <button className={`games__clear-btn ${teamPlayer.goals > 0 || teamPlayer.assists > 0 ? "active" : undefined}`} onClick={() => clearGoalsAssistsSubs(teamPlayer)}>x</button>
                <button className="games__btn games__player--stats-btn" onClick={() => addSubGoal(teamPlayer)}>{teamPlayer.goals > 0 ? teamPlayer.goals : "G"}</button>
                <button className="games__btn games__player--stats-btn" onClick={() => addSubAssist(teamPlayer)}>{teamPlayer.assists > 0 ? teamPlayer.assists : "A"}</button>
                <button className={`games__motm-btn ${motm === teamPlayer.id ? "active" : undefined}`} onClick={() => {
                    makeSubMotm(teamPlayer);
                }}></button>
            </div>
        </li>
        )
        return <div className="games__player--results">{teamItems}</div>;
    }

    const submitGame = async () => {
        if (totalAssists > totalGoals) {
            alert('You cannot have more assists than goals.');
            return;
        }
        if (motm === 0) {
            if (!window.confirm('Are you sure you want to add this game without a man of the match?')) {
                return;
            }
        }
        let result = null;
        if (totalGoals > awayGoals) {
            result = 1;
        }
        if (totalGoals === awayGoals) {
            result = 2;
        }
        if (totalGoals < awayGoals) {
            result = 3;
        }
        const newGame = {
            goalsScored: totalGoals,
            goalsConceded: awayGoals,
            result,
            dateTime: new Date().getTime()
        }
        let allTimeGames = [];
        if (localStorage.getItem(`allTimeGames-${user.uid}`)) {
            allTimeGames = JSON.parse(localStorage.getItem(`allTimeGames-${user.uid}`))
        }
        allTimeGames.push(newGame);
        localStorage.setItem(`allTimeGames-${user.uid}`, JSON.stringify(allTimeGames))
        localStorage.setItem(`allTimeGamesUpdate`, new Date().toString());

        let allTimePlayerStats = [];
        if (localStorage.getItem(`allTimePlayerStats-${user.uid}`)) {
            allTimePlayerStats = JSON.parse(localStorage.getItem(`allTimePlayerStats-${user.uid}`))
        }

        let newAllTimePlayerStats = allTimePlayerStats;

        if (allTimePlayerStats.length > 0) {
            allTimePlayerStats.forEach((allTimePlayer, index) => {
                team.forEach(player => {
                    if (allTimePlayer.id === player.id) {
                        player.games ++;
                        if (awayGoals === 0) {
                            player.cleanSheets ++;
                        }
                        if (motm === player.id) {
                            player.motms ++;
                        }
                        allTimePlayer.games = allTimePlayer.games + 1;
                        allTimePlayer.goals = allTimePlayer.goals + player.goals;
                        allTimePlayer.assists = allTimePlayer.assists + player.assists;
                        allTimePlayer.motms = allTimePlayer.motms + player.motms;
                        allTimePlayer.cleanSheets = allTimePlayer.cleanSheets + player.cleanSheets;
                        newAllTimePlayerStats[index] = allTimePlayer;
                        return;
                    } else {
                        const playerExists = id => {
                            return allTimePlayerStats.some(player => {
                                return player.id === id;
                            });
                        }
                        if (!playerExists(player.id)) {
                            player.games ++;
                            if (awayGoals === 0) {
                                player.cleanSheets ++;
                            }
                            if (motm === player.id) {
                                player.motms ++;
                            }
                            newAllTimePlayerStats.push(player);
                        }
                    }
                });
                subs.forEach(player => {
                    if (player.active) {
                        if (allTimePlayer.id === player.id) {
                            player.games ++;
                            if (awayGoals === 0) {
                                player.cleanSheets ++;
                            }
                            if (motm === player.id) {
                                player.motms ++;
                            }
                            allTimePlayer.games = allTimePlayer.games + 1;
                            allTimePlayer.goals = allTimePlayer.goals + player.goals;
                            allTimePlayer.assists = allTimePlayer.assists + player.assists;
                            allTimePlayer.motms = allTimePlayer.motms + player.motms;
                            allTimePlayer.cleanSheets = allTimePlayer.cleanSheets + player.cleanSheets;
                            newAllTimePlayerStats[index] = allTimePlayer;
                            return;
                        } else {
                            const playerExists = id => {
                                return allTimePlayerStats.some(player => {
                                    return player.id === id;
                                });
                            }
                            if (!playerExists(player.id)) {
                                player.games ++;
                                if (awayGoals === 0) {
                                    player.cleanSheets ++;
                                }
                                if (motm === player.id) {
                                    player.motms ++;
                                }
                                newAllTimePlayerStats.push(player);
                            }
                        }
                    }
                });
            });
        } else {
            team.forEach(player => {
                player.games ++;
                if (awayGoals === 0) {
                    player.cleanSheets ++;
                }
                if (motm === player.id) {
                    player.motms ++;
                }
                newAllTimePlayerStats.push(player);
            });

            subs.forEach(player => {
                if (player.active) {
                    player.games ++;
                    if (awayGoals === 0) {
                        player.cleanSheets ++;
                    }
                    if (motm === player.id) {
                        player.motms ++;
                    }
                    newAllTimePlayerStats.push(player);
                }
            })
        }
        localStorage.setItem(`allTimePlayerStats-${user.uid}`, JSON.stringify(newAllTimePlayerStats))
        localStorage.setItem('allTimePlayerStatsUpdate', new Date().toString());
     
        await updateDoc(doc(db, 'users', user.uid), {
            allTimeStats: newAllTimePlayerStats,
            games: allTimeGames
        })
        // Should be going to db as well.
        team.forEach(player => {
            if (player.goals) {
                player.goals = 0;
            }
            if (player.assists) {
                player.assists = 0;
            }
        });
        subs.forEach(player => {
            if (player.goals) {
                player.goals = 0;
            }
            if (player.assists) {
                player.assists = 0;
            }
        });
        setTeam(team);
        setSubs(subs);
        setAwayGoals(0);
        setTotalGoals(0);
        setTotalAssists(0);
        saveGame();
    }

   if (loading || gamesLoading) {
       return <p>Loading...</p>
   } else {
        if (team.length > 0 && subs.length > 0) {
            return <div className="component--add-games">
                <div className="games__top-section">
                    <p className="games__scoreline">Scoreline: 
                        <span className="games__total-goals">{totalGoals}</span>- 
                        <span className="games__total-goals" onClick={() => {
                            const newAwayGoals = awayGoals + 1;
                            setAwayGoals(newAwayGoals);
                        }}>{awayGoals}</span>
                        {awayGoals > 0 && <button className={`games__clear-btn ${awayGoals > 0 && "active"}`} onClick={() => {
                            const newAwayGoals = awayGoals - 1;
                            setAwayGoals(newAwayGoals);
                        }
                        }>-</button>}
                    </p>
                    <button className="games__add-game-btn" onClick={submitGame}>Save game</button>
                </div>
                <p>Team</p>
                {renderTeam()}
                <p>Subs</p>
                {renderSubs()}
            </div>
        } else {
            return <div className="component--add-games">
                <p>You don't have any players in your team yet. Create your team and add your first game.</p>
            </div>
        }
   }
}

export default AddGames;