import React, { useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import './Bid.scss';
import { ToggleButton } from '@mui/material';
import IGame from '../../lib/types/IGame';
import getNextPlayer from '../../lib/helpers/helpers';
import IPlayer from '../../lib/types/IPlayer';

type BidProps = {
    game: IGame,
    callback: any
}

function Bid(props:BidProps) {
    let deadlock:boolean = false;
    const handleChange = (event: any, newValue: number|undefined) => {
        if (newValue !== undefined) {
            setBid(newValue);
        }
    };

    const getPlayerIndex = (player:IPlayer) => {
        const playerName = player.name;
        for (let i=0; i<props.game.players.length; i++) {
            if (playerName === props.game.players[i].name) {
                return i;
            }
        }
        return -1;
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
            if (bid === 0 && player.zeroBids === 3 ) {
                return false;
            }
        }

        const playerIdx = getPlayerIndex(player);
        let dealerIdx = getPlayerIndex(props.game.dealer);
        console.log("PLAYER IDX:", player.name, playerIdx);
        console.log("DEALER IDX:", props.game.dealer.name, dealerIdx);
        if (dealerIdx === props.game.players.length -1) {
            // Dealer is last player, so player with index '0' should come next
            dealerIdx = -1;
        }
        if (props.game.maxReached && props.game.cardsInRound === 2 && playerIdx === dealerIdx +1) {
            // Player will deal next, final round
            if (bid === 0 && player.zeroBids === 2) {
                // Player should not be able to bid 0 anymore, since this might cause a deadlock
                deadlock = true;
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
            let finalBid = (props.game.playerToBid.name === props.game.dealer.name);
            props.game.playerToBid.bids.push(bidValue);
            props.game.roundTotalBids += bidValue;
            if (bidValue === 0) {
                props.game.playerToBid.zeroBids++;
            } else {
                props.game.playerToBid.zeroBids = 0;
            }
            props.game.playerToBid = getNextPlayer(props.game.players, props.game.playerToBid);
            if (finalBid) {
                props.game.playerToBid = getNextPlayer(props.game.players, props.game.playerToBid);
                props.callback(true, props.game);
                return;
            }
            props.callback(false, props.game);
        }
    }

    let playerBids:any = [];
    for (let i=0; i<=props.game.cardsInRound; i++) {
        let validPlayerBid = isValidBid(i);
        playerBids.push(
            <Grid xs={3}>
                <ToggleButton className='colored_button' fullWidth={true} value={i} onClick={handleChange} disabled={!validPlayerBid}><h1>{i}</h1></ToggleButton>
            </Grid>
        )
    }
    console.log("DEADLOCK:", deadlock);

    return (
        <div className='bid_container'>
            <h4>
                <span>Total bid: {props.game.roundTotalBids}/{props.game.cardsInRound}</span>
            </h4>
            <div>
                <div><h2>{props.game.playerToBid.name} to bid</h2></div>
                <div hidden={!deadlock}><h5>Cannot bid 0, possible deadlock next round.</h5></div>
                <Grid container>
                    {playerBids}
                </Grid>
            </div>
        </div>
    );
}

export default Bid;