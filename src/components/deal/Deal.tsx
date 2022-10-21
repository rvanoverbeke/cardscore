import React, { useState } from 'react';
import IGame from '../../lib/types/IGame';
import Grid from '@mui/material/Unstable_Grid2';

import './Deal.scss';
import { ToggleButton } from '@mui/material';
import { Box } from '@mui/system';

type DealProps = {
    game: IGame,
    callback?: any
}

function Deal(props:DealProps) {

    let getDealerInfo = (cards:number) => {
        let quotient = (cards / 3 >> 0);
        let remainder = cards % 3;
        let retval = [quotient, quotient, quotient];
        if (remainder === 1) {
            retval[1]++;
        } else if (remainder === 2) {
            retval[0]++;
            retval[2]++;
        }
        return retval;
    }

    let dealPattern = getDealerInfo(props.game.cardsInRound);

    let dealingDone = () => {
        if (props.callback) {
            props.callback();
        }
    }

    let dealer = props.game.dealer;

    return (
        <Grid container spacing={5} className='deal_container'>
            <Grid xs={12}><h1>{dealer.name} to deal {props.game.cardsInRound} cards</h1></Grid>
            <Grid xs={3}></Grid>
            <Grid xs={2} className="deal_card">
                <div>{dealPattern[0]}</div>
            </Grid>
            <Grid xs={2} className="deal_card">
                <div>{dealPattern[1]}</div>
            </Grid>
            <Grid xs={2} className="deal_card">
                <div>{dealPattern[2]}</div>
            </Grid>
            <Grid xs={3}></Grid>
            <Grid xs={12}><ToggleButton className="deal_button" fullWidth={true} value="" onClick={dealingDone} ><h1>Dealt!</h1></ToggleButton></Grid>
        </Grid>
    );
}

export default Deal;