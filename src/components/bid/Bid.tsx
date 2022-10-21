import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import './Bid.scss';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import IGame from '../../lib/types/IGame';
import getNextPlayer from '../../lib/helpers/helpers';

type BidProps = {
    game: IGame,
    callback?: any
}

function Bid(props:BidProps) {
    const [done, setDone] = useState(false);
    const [player, setPlayer] = useState(props.game.startPlayer);
    const [sumBids, setSumBids] = useState(0);
    
    let resetBid = ()  => {
        console.log("Reset", player);
        let nextPlayer = getNextPlayer(props.game, player)
        setPlayer(getNextPlayer(props.game, nextPlayer));
        setSumBids(0);
        setDone(false);
    }

    const handleChange = (event: any, newValue: number|undefined) => {
        if (newValue != undefined) {
            setBid(newValue);
        }
    };

    let isValidBid = (bid:number|undefined) => {
        if (bid == undefined) {
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
        if (player === props.game.dealer && props.game.cardsInRound === (sumBids + bid)) {
            return false;
        }
        return true;
    }

    let setBid = (bidValue:number|undefined) => {
        if (isValidBid(bidValue) && bidValue != undefined) {
            player.bids.push(bidValue);
            if (player === props.game.dealer) {
                setDone(true);
                if (props.callback) {
                    props.callback(true, props.game);
                }
                resetBid();
                return;
            }
            setSumBids(sumBids + bidValue);
            setPlayer(getNextPlayer(props.game, player));
            if (props.callback) {
                props.callback(false, props.game);
            }
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
                <span>Total bid: {sumBids}/{props.game.cardsInRound}</span>
            </h4>
            { !done ?  
            <div>
                <div><h2>{player.name} to bid</h2></div>
                <Grid container>
                    {playerBids}
                </Grid>
            </div>
        :null}
                
        </div>
    );
}

export default Bid;