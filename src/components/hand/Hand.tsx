import React, { useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import './Hand.scss';
import { ToggleButton } from '@mui/material';
import IGame from '../../lib/types/IGame';

type HandProps = {
    game: IGame,
    callback?: any
}

function Hand(props:HandProps) {
    const [done, setDone] = useState(false);
    const [hand, setHand] = useState(1);
    
    let resetHand = ()  => {
        setDone(false);
    }

    const handleChange = (event: any, newValue: number|undefined) => {
        if (newValue != undefined) {
            let player = props.game.players[newValue];
            player.hands[props.game.round-1]++;
            if (hand === props.game.cardsInRound) {
                setDone(true);
                if (props.callback) {
                    props.callback(true, props.game);
                }
                resetHand();
                return;
            }
            setHand(hand + 1);
            if (props.callback) {
                props.callback(false, props.game);
            }
            console.log(player.name, player.hands);
        }
    };

    let playerButtons:any = [];
    for (let i=0; i<props.game.players.length; i++) {
        let player = props.game.players[i];
        if (player.hands.length < props.game.round) {
            player.hands.push(0);
        }
        console.log('player', player);
        playerButtons.push(
            <Grid xs={4} md={3}><ToggleButton className="player_name" fullWidth={true} value={i} onClick={handleChange} ><h1>{player.name}</h1></ToggleButton></Grid>
        )
    }

    return (
        <div className='hand_container'>
            { !done ?  
            <div>
                <div><h1>Hand {hand} of {props.game.cardsInRound}</h1></div>
                <Grid container>
                    {playerButtons}
                </Grid>
            </div>
        :<h1>Done</h1>}
                
        </div>
    );
}

export default Hand;