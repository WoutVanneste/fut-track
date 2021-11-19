import React, { useEffect, useState } from 'react';
import { auth} from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import '../styling/Games.scss';

// const game1 = [
//     {
//         "goalsConceded": 0,
//         "goalsScored": 2,
//         "result": 1,
//         "dateTime": 1637170253628
//     }
// ];
// const game2 = [
//     {
//         "goalsConceded": 3,
//         "goalsScored": 2,
//         "result": 1,
//         "dateTime": 1637171043978
//     }
// ];
// // Reguilon, fellaini en gravenberg sub on - allemaal clean sheet zonder kaarten.
// const playersUpdate1 = [
//     {
//         "name": "mpabbe",
//         "goals":  1
//     },
//     {
//         "name": "keane",
//         "goals": 1
//     },
//     {
//         "name": "cuadrado",
//         "assists": 2
//     },
//     {
//         "name": "szcensny",
//         "manOfThematches": 1
//     }
// ];
// // Reguillon sub on
// const playersUpdate2 = [
//     {
//         "name": "mpabbe",
//         "goals":  2,
//         "manOfThematches": 1
//     },
//     {
//         "name": "keane",
//         "goals": 1,
//         "assists": 2
//     },
//     {
//         "name": "fofana",
//         "assists": 1
//     }
// ];

const AddGames = ({saveGame}) => {
    const [motm, setMotm] = useState(0);
    const [user, loading, error] = useAuthState(auth);
    const [team, setTeam] = useState([]);
    const [subs, setSubs] = useState([]);
    const [awayGoals, setAwayGoals] = useState(0);
    const [totalGoals, setTotalGoals] = useState(0);
    const [totalAssists, setTotalAssists] = useState(0);

    useEffect(() => {
        if (user) {
            setTeam(JSON.parse(localStorage.getItem(`${user.uid}-team`)));
            setSubs(JSON.parse(localStorage.getItem(`${user.uid}-subs`)));
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
        if (newSubs[index].goals) {
            newSubs[index].goals += 1;
        } else {
            newSubs[index].goals = 1;
        }
        newSubs[index].active = true;
        setSubs(newSubs);
        const newTotalGoals = totalGoals + 1;
        setTotalGoals(newTotalGoals);
    }
    
    const addSubAssist = player => {
        const newSubs = [...subs];
        const index = newSubs.findIndex((teamPlayer) => teamPlayer.id === player.id);
        if (newSubs[index].assists) {
            newSubs[index].assists += 1;
        } else {
            newSubs[index].assists = 1;
        }
        newSubs[index].active = true;
        setSubs(newSubs);
        const newTotalAssists = totalAssists + 1;
        setTotalAssists(newTotalAssists);
    }
    
    const makeSubMotm = (player) => {
        const newSubs = [...subs];
        const index = newSubs.findIndex((teamPlayer) => teamPlayer.id === player.id);
        newSubs[index].active = true;
        setSubs(newSubs);
        setMotm(player.id);
    }

    const setPlayerActive = player => {
        const newSubs = [...subs];
        const index = newSubs.findIndex((teamPlayer) => teamPlayer.id === player.id);
        newSubs[index].active = !newSubs[index].active;
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

    const submitGame = () => {
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

        let allTimePlayerStats = [];
        if (localStorage.getItem(`allTimePlayerStats-${user.uid}`)) {
            allTimePlayerStats = JSON.parse(localStorage.getItem(`allTimePlayerStats-${user.uid}`))
        }
        let newAllTimePlayerStats = [];

        team.forEach(player => {
            player.games ++;
            if (awayGoals === 0) {
                player.cleanSheets ++;
            }
            if (motm === player.id) {
                player.motms ++;
            }
            allTimePlayerStats.forEach(statsPlayer => {
                if (statsPlayer.id === player.id) {
                    player.games = statsPlayer.games + 1;
                    player.goals = statsPlayer.goals + player.goals;
                    player.assists = statsPlayer.assists + player.assists;
                    player.motms = statsPlayer.motms + player.motms;
                    player.cleanSheets = statsPlayer.cleanSheets + player.cleanSheets;
                }
            })
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
                allTimePlayerStats.forEach(statsPlayer => {
                    if (statsPlayer.id === player.id) {
                        player.games = statsPlayer.games + 1;
                        player.goals = statsPlayer.goals + player.goals;
                        player.assists = statsPlayer.assists + player.assists;
                        player.motms = statsPlayer.motms + player.motms;
                        player.cleanSheets = statsPlayer.cleanSheets + player.cleanSheets;
                    }
                })
                newAllTimePlayerStats.push(player);
            }
        })

        console.log('alltimeplayer stats set to:', newAllTimePlayerStats);
        debugger;
        
        localStorage.setItem(`allTimePlayerStats-${user.uid}`, JSON.stringify(newAllTimePlayerStats))

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
}

export default AddGames;