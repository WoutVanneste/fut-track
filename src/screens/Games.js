import React, { useEffect, useState } from 'react';
import { auth} from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import AddGames from '../components/Add-game';
import '../styling/Games.scss';
import { db } from '../firebase';
import { collection } from 'firebase/firestore/lite';
import {
    getDoc,
    doc
   } from '@firebase/firestore/lite';

const Games = () => {
    const [addingGame, setAddingGame] = useState(false);
    const [games, setGames] = useState([]);
    const [user, loading, error] = useAuthState(auth);
    const [gamesLoading, setGamesLoading] = useState(false);


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
    }, [error, loading, user])

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
            if (localStorage.getItem('allTimeGamesUpdate')) {
                const localDate = localStorage.getItem('allTimeGamesUpdate');
                const millisecondsDiff = Math.abs(date.getTime() - new Date(localDate).getTime());
        
                // If 2 days no update, do update 
                if (millisecondsDiff > 172800000) {
                    getGames(db);
                } else {
                    if (localStorage.getItem(`allTimeGames-${user.uid}`)) {
                        setGames(JSON.parse(localStorage.getItem(`allTimeGames-${user.uid}`)))
                    }
                }
            } else {
                if (localStorage.getItem(`allTimeGames-${user.uid}`)) {
                    setGames(JSON.parse(localStorage.getItem(`allTimeGames-${user.uid}`)))
                }
            }
        }
        
    }, [user])

    const renderGames = () => {
       if (games.length > 0) {
            const sortedGames = games.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
            const gameItems = sortedGames.map((game, index) => 
                <li className={`games__list--item ${game.result === 1 ? 'win' : ''} ${game.result === 2 ? 'draw' : ''} ${game.result === 3 ? 'loss' : ''}`} key={index}>
                    <p className="games__list--result">{game.goalsScored} - {game.goalsConceded}</p>
                    <p className="games__list--date">Date: {new Date(game.dateTime).toLocaleString().toString()}</p>
                </li>
            )
            return <div>{gameItems}</div>
        } else {
            return <p>No games added so far.</p>
        }
    }

    if (loading || gamesLoading) {
        return <div className="page--games">
            <h1>Games</h1>
            <p>Loading games...</p>
        </div>
    }

    return <div className="page--games">
        <div className="games__top">
            <h1>Games</h1>
            {!addingGame ?
            <button className="games__add-game-btn" onClick={() => {
                setAddingGame(true);
            }}>Add game</button> :
            <button className="games__add-game-btn games__add-game-btn--remove" onClick={() => {
                setAddingGame(false);
            }}>x</button>}
        </div>
        {addingGame ?
         <AddGames saveGame={() => {
             setAddingGame(false)
             setGames(JSON.parse(localStorage.getItem(`allTimeGames-${user.uid}`)))
         }} /> : renderGames()}
    </div>
}

export default Games;