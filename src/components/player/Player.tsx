import { IconButton, TextField, ToggleButton } from "@mui/material";
import React, { useState } from 'react';
import RemoveCircleTwoToneIcon from '@mui/icons-material/RemoveCircleTwoTone';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import Grid from '@mui/material/Unstable_Grid2';
import './Player.scss';

type playerProps = {
    onSubmit?: any;
}

function Player(props:playerProps) {
    const [players, setPlayers] = useState(["", "", "", ""])
    const [dealer, setDealer] = useState<number|undefined>(undefined);

    let handleChange = (idx:number, elem:any) => {
        let newPlayers = [...players];
        newPlayers[idx] = elem.target.value;
        setPlayers(newPlayers);
    }

    let addPlayer = () => {
        setPlayers([...players, ""])
    }

    let removePlayer = (idx:number) => {
        let newPlayers = [...players];
        newPlayers.splice(idx, 1);
        setPlayers(newPlayers);
        if (dealer === idx) {
            setDealer(undefined);
        }
    }

    let handleSubmit = (event:any) => {
        event.preventDefault();
        if (props.onSubmit) {
            props.onSubmit(players, dealer);
        }
    }
    let errors:any[] = [];
    if (dealer == undefined) {
        errors.push(<div>Please select a dealer</div>);
    }
    if (players.includes('')) {
        errors.push(<div>Please enter player names</div>);
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Enter player names</h1>
            <div className="player_error">
                {errors}
            </div>
            
            {players.map((playerName:string, idx:number) => (
                <div key={idx} className='player_container'>
                    <Grid container>
                        <Grid xs={10}>
                            <TextField label="Player name" required fullWidth={true} onChange={e => handleChange(idx, e)} key={idx} />
                        </Grid>
                        <Grid xs={1}>
                            <IconButton disabled={idx < 3} onClick={() => removePlayer(idx)}><RemoveCircleTwoToneIcon/></IconButton>
                        </Grid>
                        <Grid xs={1}>
                            <IconButton onClick={() => setDealer(idx)} color={dealer===idx? 'success':'default'}><CheckCircleTwoToneIcon/></IconButton>
                        </Grid>
                    </Grid>
                </div>
           ))}
           <div className="button-section">
            <Grid container>
                <Grid xs={6}>
                    <ToggleButton className='button' fullWidth={true} value={'add'} onClick={addPlayer} ><h1>Add player</h1></ToggleButton>
                </Grid>
                <Grid xs={6}>
                    <ToggleButton disabled={dealer == undefined || dealer >= players.length || players.includes('')} className='button' fullWidth={true} type="submit" value={'submit'}><h1>Play!</h1></ToggleButton>
                </Grid>
            </Grid>
          </div>

        </form>
    );
}

export default Player;