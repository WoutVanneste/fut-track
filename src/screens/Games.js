import React, { useEffect, useState } from 'react';
import { auth} from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import AddGames from '../components/Add-game';
import '../styling/Games.scss';

const Games = () => {
    const [addingGame, setAddingGame] = useState(false);
    const [games, setGames] = useState([]);
    const [user, loading, error] = useAuthState(auth);


    useEffect(() => {
        if (loading) {
            // maybe trigger a loading screen
            return;
        }
        if (user) {
            if (localStorage.getItem(`allTimeGames-${user.uid}`)) {
                setGames(JSON.parse(localStorage.getItem(`allTimeGames-${user.uid}`)))
            }
        }
    }, [loading, user])

    const renderGames = () => {
        const sortedGames = games.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
        const gameItems = sortedGames.map((game, index) => 
            <li className={`games__list--item ${game.result === 1 ? 'win' : ''} ${game.result === 2 ? 'draw' : ''} ${game.result === 3 ? 'loss' : ''}`} key={index}>
                <p className="games__list--result">{game.goalsScored} - {game.goalsConceded}</p>
                <p className="games__list--date">Date: {new Date(game.dateTime).toLocaleString().toString()}</p>
            </li>
        )

        return <div>{gameItems}</div>
    }

    if (loading) {
        return <div className="page--games">
            <h1>Game</h1>
            <p>Loading games...</p>
        </div>
    }

    return <div className="page--games">
        <div className="games__top">
            <h1>Game</h1>
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