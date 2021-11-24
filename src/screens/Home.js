import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router";
import { auth } from "../firebase";
import "../styling/Home.scss";
import { collection, getDocs } from 'firebase/firestore/lite';
import { db, app } from '../firebase';
import {
    getFirestore,
   } from '@firebase/firestore/lite';

const StyledBar = styled.div`
    display: inline-block;
    height: 30px;
    content: "${props => props.width}";
    width: calc(${props => props.width}% - 25px);
    background-color: ${props => props.isGoalsScored ? "#C2F655" : "#8B0617"};
    position: relative;
    display: inline-flex;
    align-items: center;
    ${props => props.isGoalsScored ? 
        `
        left: 0px;
        color: #242834;
        justify-content: flex-start;
        padding-left: 25px;
        &::after {
            content: "";
            display: inline-block;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 15px 26.0px 15px 0;
            position: absolute;
            left: -26px;
            border-color: transparent #C2F655 transparent transparent;
        };` :
        `
        right: 0px;
        justify-content: flex-end;
        padding-right: 25px;
        &::after {
            content: "";
            display: inline-block;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 15px 0 15px 26.0px;
            position: absolute;
            right: -26px;
            border-color: transparent transparent transparent #8B0617;
        };`
    }
`;

const Home = () => {
    const [user, loading, error] = useAuthState(auth);
    const [playerStats, setPlayerStats] = useState([]);
    const [games, setGames] = useState([]);
    const [teamLoading, setTeamLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) {
            return;
        }
        if (error) {
            console.log('error', error);
        }
        if (!user) navigate("/");
    }, [user, loading, error, navigate]);

    useEffect(() => {
        if (user) {
            if (localStorage.getItem(`allTimeGames-${user.uid}`)) {
                setGames(JSON.parse(localStorage.getItem(`allTimeGames-${user.uid}`)))
            }
            async function updateLocalStorageFromDb(db) {
                setTeamLoading(true);
                const firestore = getFirestore(app);
                const usersRef = collection(firestore, 'users');
                const usersSnapshot = await getDocs(usersRef);
                const teamsList = usersSnapshot.docs.map(doc => doc.data())[0];
                localStorage.setItem(`allTimePlayerStats-${user.uid}`, JSON.stringify(teamsList.allTimeStats))
                localStorage.setItem('allTimePlayerStatsUpdate', new Date().toString());
                localStorage.setItem(`allTimeGames-${user.uid}`, JSON.stringify(teamsList.games))
                localStorage.setItem('allTimeGamesUpdate', new Date().toString());
                setGames(teamsList.games);
                setPlayerStats(teamsList.allTimeStats);
                setTeamLoading(false);
            }
            const date = new Date();
            if (localStorage.getItem('allTimePlayerStatsUpdate')) {
                const localDate = localStorage.getItem('allTimePlayerStatsUpdate');
                const millisecondsDiff = Math.abs(date.getTime() - new Date(localDate).getTime());
                // If 6 hours no update, do update 
                if (millisecondsDiff > 21600000) {
                    updateLocalStorageFromDb(db);
                } else {
                    if (localStorage.getItem(`allTimePlayerStats-${user.uid}`)) {
                        setPlayerStats(JSON.parse(localStorage.getItem(`allTimePlayerStats-${user.uid}`)));
                    }
                }
            } else {
                if (localStorage.getItem(`allTimePlayerStats-${user.uid}`)) {
                    setPlayerStats(JSON.parse(localStorage.getItem(`allTimePlayerStats-${user.uid}`)));
                }
            }

            if (localStorage.getItem('allTimeGamesUpdate')) {
                const localDate = localStorage.getItem('allTimeGamesUpdate');
                const millisecondsDiff = Math.abs(date.getTime() - new Date(localDate).getTime());
                // If 6 hours no update, do update 
                if (millisecondsDiff > 21600000) {
                    updateLocalStorageFromDb(db);
                } else {
                    if (localStorage.getItem(`allTimeGames-${user.uid}`)) {
                        setGames(JSON.parse(localStorage.getItem(`allTimeGames-${user.uid}`)));
                    }
                }
            } else {
                if (localStorage.getItem(`allTimeGames-${user.uid}`)) {
                    setGames(JSON.parse(localStorage.getItem(`allTimeGames-${user.uid}`)));
                }
            }
               
        }
    }, [user])

    const renderOverview = () => {
        if (games.length > 0) {
            let wins = 0;
            let draws = 0;
            let losses = 0;
            games.forEach(game => {
                // eslint-disable-next-line default-case
                switch(game.result) {
                    case 1: wins ++;
                    break;
                    case 2: draws++;
                    break;
                    case 3: losses++;
                    break;
                }
            });
            return <div className="overview__container">
                <h1>Overview</h1>
                <div className="overview__icons">
                    <div className="overview__wins">
                        <span className="overview__wins-text">{wins}</span>
                    </div>
                    <div className="overview__draws">
                        <span className="overview__draws-text">{draws}</span>
                    </div>
                    <div className="overview__losses">
                        <span className="overview__losses-text">{losses}</span>
                        </div>
                    </div>
                </div>
        } else {
            return <div>
                <div className="overview__container">
                    <h1>Overview</h1>
                </div>
                <p>No data found for your club. Add a team and your first game to see the stats!</p>
            </div>
        }
    }

    const renderMostGoals = () => {
        if (playerStats.length > 0) {
            const sortedPlayers = playerStats.sort((a, b) => {
                if (a.goals === b.goals) {
                    if (a.assists === b.assists) {
                        return a.games < b.games ? 1 : -1
                    }
                    return a.assists < b.assists ? 1 : -1
                 }
                 return a.goals < b.goals ? 1 : -1;
            });
            let topPlayer = sortedPlayers[0];
            if (topPlayer) {
                const goalsPerGame = Math.round(topPlayer.goals/topPlayer.games * 10) / 10;
                return <div className="top__goals">
                    <h2 className="top__goals--title">Goals</h2>
                    <img className="top__goals--image" alt={topPlayer.name} src={topPlayer.image} />
                    <span className="top__goals--name">{topPlayer.name.length > 20 ? topPlayer.name.substring(0, 20) + "..." : topPlayer.name}</span>
                    <span className="top__goals--info">{topPlayer.goals} goals</span>
                    <span className="top__goals--info">{goalsPerGame} goals / game</span>
                </div>
            }
        }
    }

    const renderMostAssists = () => {
        if (playerStats.length > 0) {
            const sortedPlayers = playerStats.sort((a, b) => {
                if (a.assists === b.assists) {
                    if (a.goals === b.goals) {
                        return a.games < b.games ? 1 : -1
                    }
                    return a.goals < b.goals ? 1 : -1
                 }
                 return a.assists < b.assists ? 1 : -1;
            });
            let topPlayer = sortedPlayers[0];
            if (topPlayer) {
                const assistsPerGame = Math.round(topPlayer.assists/topPlayer.games * 10) / 10;
                return <div className="top__assists">
                    <h2 className="top__assists--title">Assists</h2>
                    <img className="top__assists--image" alt={topPlayer.name} src={topPlayer.image} />
                    <span className="top__assists--name">{topPlayer.name.length > 20 ? topPlayer.name.substring(0, 20) + "..." : topPlayer.name}</span>
                    <span className="top__assists--info">{topPlayer.assists} assists</span>
                    <span className="top__assists--info">{assistsPerGame} assists / game</span>
                </div>
            }
        }
    }

    const renderGameGoals = () => {
        if (games.length > 0) {
            let goalsScored = 0;
            let goalsConceded = 0;
            games.forEach(game => {
                goalsScored += game.goalsScored;
                goalsConceded += game.goalsConceded;
            })
            const averageGoalsScored = Math.round(goalsScored / games.length * 10) / 10;
            const averageGoalsConceded = Math.round(goalsConceded / games.length * 10) / 10;
            let totalScored = Math.round(goalsScored / (goalsScored + goalsConceded) * 100);
            let totalConceded = Math.round(goalsConceded / (goalsScored + goalsConceded) * 100);
            if (totalScored + totalConceded > 100) {
                totalConceded --;
            }
            totalScored = totalScored < 15 ? 15 : totalScored;
            totalScored = totalScored > 85 ? 85 : totalScored;
            totalConceded = totalConceded < 15 ? 15 : totalConceded;
            totalConceded = totalConceded > 85 ? 85 : totalConceded;
            return <div>
                <h2 className="game__goals--title">Total / average goals</h2>
                {/* eslint-disable-next-line react/jsx-no-undef */}
                <div className="game__goals--average">
                    <span>{averageGoalsScored} goals / game</span>
                    <span>{averageGoalsConceded} goals / game</span>
                </div>
                <div className="styled__bar--wrapper">
                    <StyledBar isGoalsScored={true} width={totalScored}>
                        {goalsScored}
                    </StyledBar>
                    <StyledBar isGoalsScored={false} width={totalConceded}>
                        {goalsConceded}
                    </StyledBar>
                </div>
            </div>
        }
    }

    const renderLast5Games = () => {
       if (games.length > 0) {
            let lastGames = games;
            lastGames.sort((a,b) => new Date((a.dateTime) < new Date(b.dateTime) ? 1 : -1));
            lastGames = lastGames.slice(0,5);
            let list = [];
            lastGames.forEach((game, index) => {
                // eslint-disable-next-line default-case
                switch (game.result) {
                    case 1:
                        list.push(<div key={index} className="last__games--win"></div>)
                        break;
                    case 2:
                        list.push(<div key={index} className="last__games--draw"></div>)
                        break;
                    case 3:
                        list.push(<div key={index} className="last__games--loss"></div>)
                        break;
                }
            })

            return <div className="last__games">
                <h2 className="last__games--title">Last 5 games</h2>
                <div className="last__games--icons">
                    {list.map(item => item)}
                </div>
                </div>
       }
    }

    const renderGeneralStats = () => {
        if (games.length > 0) {
            let biggestWin = {
                goals: 0,
                awayGoals: 1000
            };
            let cleanSheets = 0;
            games.forEach(game => {
                if (game.goalsConceded === 0) {
                    cleanSheets++;
                }
                const diff = game.goalsScored - game.goalsConceded;
                if (diff > (biggestWin.goals - biggestWin.awayGoals)) {
                    biggestWin.goals = game.goalsScored;
                    biggestWin.awayGoals = game.goalsConceded;
                }
            })
            const bestResult = <p>Best result: {biggestWin.goals} - {biggestWin.awayGoals}</p>
            const cleanSheetsElement = <p>Cleansheets: {cleanSheets}</p>
            return <div>
                {bestResult}
                {cleanSheetsElement}
            </div>
        }
    }

    if (loading || teamLoading) {
        return <div className="page--home">
            <div className="overview__container"><h1>Overview</h1></div>
            <p>Loading overview...</p>
        </div>
    }

    return <div className="page--home">
        {renderOverview()}
        <div className="home--content">
            <div className="top__goals__assists">
                {renderMostGoals()}
                {renderMostAssists()}
            </div>
            <div className="game__goals">
                {renderGameGoals()}
            </div>
            <div className="general__stats">
                <div>
                    {renderLast5Games()}
                </div>
                {renderGeneralStats()}
            </div>
        </div>
    </div>
}

export default Home;