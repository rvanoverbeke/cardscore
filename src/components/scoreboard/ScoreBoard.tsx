import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';

import './ScoreBoard.scss';
import IGame from '../../lib/types/IGame';
import { Badge } from '@mui/material';


type ScoreBoardProps = {
    game: IGame;
}

function ScoreBoard(props:ScoreBoardProps) {

    let scoreItems:any = [];
    props.game.players.forEach(player => {
        let bid = '-'
        if (player.bids.length === props.game.round) {
            bid = '' + player.bids[props.game.round -1];
        }
        let roundScore = '-';
        if (player.hands.length === props.game.round) {
            roundScore = '' + player.hands[props.game.round -1];
        }

        scoreItems.push(
            <Grid xs={6} sm={4} md={3}>
                <Grid container spacing={0} className="player_score_container">
                    <Grid xs={8} className='player_name'>{player.name}</Grid>
                    <Badge badgeContent={player.zeroBids} color={player.zeroBids >= 2 ? 'warning': 'default'}>
                        <Grid xs={2} className='player_round_bid'>({bid})</Grid>
                    </Badge>
                    <Grid xs={1} className='player_round_score'>{roundScore}</Grid>
                    <Grid xs={1} className='player_total_score'>{player.score}</Grid>
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