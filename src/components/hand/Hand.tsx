import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import './Hand.scss';
import { ToggleButton } from '@mui/material';
import IGame from '../../lib/types/IGame';

type HandProps = {
    game: IGame,
    callback: any
}

function Hand(props:HandProps) {
    
    const handleChange = (event: any, newValue: number|undefined) => {
        if (newValue !== undefined) {
            let player = props.game.players[newValue];
            player.hands[props.game.round-1]++;
            if (props.game.roundCurrentHand === props.game.cardsInRound) {
                props.callback(true, props.game);
                return;
            }
            props.game.roundCurrentHand++;
            props.callback(false, props.game);
            console.log(player.name, player.hands);
        }
    };

    let playerButtons:any = [];
    for (let i=0; i<props.game.players.length; i++) {
        let player = props.game.players[i];
        if (player.hands.length < props.game.round) {
            player.hands.push(0);
        }
        playerButtons.push(
            <Grid xs={6} sm={4} md={3}><ToggleButton className='colored_button' fullWidth={true} value={i} onClick={handleChange} ><h1>{player.name}</h1></ToggleButton></Grid>
        )
    }

    return (
        <div className='hand_container'>
            <div>
                <div><h1>Hand {props.game.roundCurrentHand} of {props.game.cardsInRound}</h1></div>
                <Grid container>
                    {playerButtons}
                </Grid>
            </div>
        </div>
    );
}

export default Hand;