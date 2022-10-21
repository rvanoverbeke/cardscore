import React, { useState } from 'react';
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import Grid from '@mui/material/Unstable_Grid2';

import './ScoreBoard.scss';
import IGame from '../../lib/types/IGame';


type ScoreBoardProps = {
    game: IGame;
}

function ScoreBoard(props:ScoreBoardProps) {
    const [players, setPlayers] = useState(props.game.players);

    let scoreItems:any = [];
    players.forEach(player => {
        let bid = '-'
        if (player.bids.length === props.game.round) {
            bid = '' + player.bids[props.game.round -1];
        }
        let roundScore = '-';
        if (player.hands.length === props.game.round) {
            roundScore = '' + player.hands[props.game.round -1];
        }
        scoreItems.push(
            <Grid xs={6} md={3}>
                <Grid container spacing={2} className="player_score_container">
                    <Grid xs={7} className='player_name'>{player.name}</Grid>
                    <Grid xs={5} className='player_score'>
                        <span className='player_round_bid'>({bid})</span>
                        <span> </span>
                        <span className='player_round_score'>{roundScore}</span>
                        <span> | </span>
                        <span className='player_total_score'>{player.score}</span>
                    </Grid>
                </Grid>
            </Grid>
        );
    });

    return (
        <div className='scoreboard_container'>
            <Grid container spacing={2}>{scoreItems}</Grid>
        </div>
    );
}

export default ScoreBoard;