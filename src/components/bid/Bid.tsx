import React, { useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import './Bid.scss';
import { ToggleButton } from '@mui/material';
import IGame from '../../lib/types/IGame';
import getNextPlayer from '../../lib/helpers/helpers';

type BidProps = {
    game: IGame,
    callback: any
}

function Bid(props:BidProps) {
    
    const handleChange = (event: any, newValue: number|undefined) => {
        if (newValue !== undefined) {
            setBid(newValue);
        }
    };

    let isValidBid = (bid:number|undefined) => {
        let player = props.game.playerToBid;
        if (bid === undefined) {
            return false;
        }
        if (bid > props.game.cardsInRound) {
            return false;
        }
        if (bid < 0) {
            return false;
        }
        if (player.bids.length >= 3) {
            let i = player.bids.length - 1;
            if (bid === 0 && player.bids[i] === 0 && player.bids[i-1] === 0 && player.bids[i-2] === 0 ) {
                return false;
            }
        }
        if (player === props.game.dealer && props.game.cardsInRound === (props.game.roundTotalBids + bid)) {
            return false;
        }
        return true;
    }

    let setBid = (bidValue:number|undefined) => {
        if (isValidBid(bidValue) && bidValue !== undefined) {
            props.game.playerToBid.bids.push(bidValue);
            if (props.game.playerToBid === props.game.dealer) {
                let nextPlayer = getNextPlayer(props.game.players, props.game.playerToBid)
                props.game.playerToBid = getNextPlayer(props.game.players, nextPlayer);
                props.game.roundTotalBids = 0;
                props.callback(true, props.game);
                return;
            }
            props.game.roundTotalBids += bidValue;
            props.game.playerToBid = getNextPlayer(props.game.players, props.game.playerToBid);
            props.callback(false, props.game);
        }
    }

    let playerBids:any = [];
    for (let i=0; i<=props.game.cardsInRound; i++) {
        let validPlayerBid = isValidBid(i);
        playerBids.push(
            <Grid xs={3}>
                <ToggleButton className='bid_button' fullWidth={true} value={i} onClick={handleChange} disabled={!validPlayerBid}><h1>{i}</h1></ToggleButton>
            </Grid>
        )
    }

    return (
        <div className='bid_container'>
            <h4>
                <span>Total bid: {props.game.roundTotalBids}/{props.game.cardsInRound}</span>
            </h4>
            <div>
                <div><h2>{props.game.playerToBid.name} to bid</h2></div>
                <Grid container>
                    {playerBids}
                </Grid>
            </div>
        </div>
    );
}

export default Bid;