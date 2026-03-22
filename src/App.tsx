import { AppBar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, MenuItem, Select, TextField, ToggleButton, Toolbar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import './App.scss';
import Deal from './components/deal/Deal';
import Player from './components/player/Player';
import Bid from './components/bid/Bid';
import ScoreBoard from './components/scoreboard/ScoreBoard';
import getNextPlayer from './lib/helpers/helpers';
import IGame from './lib/types/IGame';
import LogoutTwoToneIcon from '@mui/icons-material/LogoutTwoTone';
import FavoriteTwoToneIcon from '@mui/icons-material/FavoriteTwoTone';
import UndoTwoToneIcon from '@mui/icons-material/UndoTwoTone';
import PersonAddTwoToneIcon from '@mui/icons-material/PersonAddTwoTone';
import Grid from '@mui/material/Unstable_Grid2';

import IPlayer from './lib/types/IPlayer';
import Hand from './components/hand/Hand';
import { Container } from '@mui/system';
const _ = require('lodash');

function App() {
  const TOTAL_CARDS = 51; // 52 cards, but we need to always have at least one extra for trump
  const STARTING_CARDS = 3;
  const POINTS_CORRECT = 5;
  const STATE_DEALING = 'DEALING';
  const STATE_BIDDING = 'BIDDING';
  const STATE_PLAYING = 'PLAYING';

  const [game, setGame] = useState<IGame|undefined>(() => {
    try { return JSON.parse(localStorage.getItem('cp_game') || 'null') ?? undefined; }
    catch { return undefined; }
  });
  const [history, setHistory] = useState<(IGame|undefined)[]>(() => {
    try { return JSON.parse(localStorage.getItem('cp_history') || 'null') ?? []; }
    catch { return []; }
  });
  const [endOfRound, setEndOfRound] = useState(false);
  const [exitDialog, setExitDialog] = useState(false);
  const [addPlayerDialog, setAddPlayerDialog] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerSeat, setNewPlayerSeat] = useState(0);
  const [playerScores, setPlayerScores] = useState<any>([]);
  const [gameOver, setGameOver] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('cp_gameOver') || 'false'); }
    catch { return false; }
  });

  useEffect(() => {
    console.log('History:', history.length, [...history]);
    localStorage.setItem('cp_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('cp_game', JSON.stringify(game ?? null));
  }, [game]);

  useEffect(() => {
    localStorage.setItem('cp_gameOver', JSON.stringify(gameOver));
  }, [gameOver]);

  let initPlayers = (playerNames: string[], dealer: number) => {
    let newPlayers:IPlayer[] = [];
    playerNames.forEach(playerName => {
      newPlayers.push({name: playerName, score: 0, bids: [], hands: [], zeroBids: 0})
    });
    startGame(newPlayers, dealer);
  }

  let newGame = () => {
    localStorage.removeItem('cp_game');
    localStorage.removeItem('cp_history');
    localStorage.removeItem('cp_gameOver');
    setGame(undefined);
    setHistory([]);
    setExitDialog(false);
    setGameOver(false);
  }

  let startGame = (players: IPlayer[], dealerIdx: number) => {
    let dealer = players[dealerIdx];
    let playerToStart = getNextPlayer(players, dealer);
    let maxCards = (TOTAL_CARDS / players.length >> 0);
    let newGame:IGame = {
      players: players,
      maxCards: maxCards,
      round: 1,
      cardsInRound: STARTING_CARDS,
      roundTotalBids: 0,
      roundCurrentHand: 1,
      maxReached: false,
      dealer: dealer,
      playerToStart: playerToStart,
      playerToBid: playerToStart,
      gameState: STATE_DEALING
    }
    copyGame(newGame);
  }

  let nextRound = () => {
    if (!game) {
      return;
    }
    if (game.maxReached && game.cardsInRound === 1) {
      setGameOver(true);
      return;
    }
    let newGame = game;
    newGame.round++;
    newGame.roundTotalBids = 0;
    newGame.roundCurrentHand = 1;
    newGame.dealer = getNextPlayer(newGame.players, newGame.dealer);
    newGame.playerToStart = getNextPlayer(newGame.players, newGame.dealer);
    newGame.playerToBid = newGame.playerToStart;
    console.log('dealer', newGame.dealer);
    console.log('startPlayer', newGame.playerToStart);
    if (newGame.cardsInRound === newGame.maxCards) {
      newGame.maxReached = true;
    }
    if (newGame.maxReached) {
      newGame.cardsInRound--;
    } else {
      newGame.cardsInRound++;
    }
    newGame.gameState = STATE_DEALING;
    copyGame(newGame);
  }

  let copyGame = (newGame:IGame|undefined) => {
    let deepCopyGame1 = _.cloneDeep(newGame);
    let deepCopyGame2 = _.cloneDeep(newGame);
    setGame(deepCopyGame1);
    setHistory([...history, deepCopyGame2]);
  }

  let dealtCallback = (newGame: IGame) => {
    newGame.gameState = STATE_BIDDING;
    copyGame(newGame);
  }

  let bidCallback = (biddingDone:boolean, newGame:IGame) => {
    if (biddingDone) {
      console.log("Bidding done");
      newGame.gameState = STATE_PLAYING;
    }
    copyGame(newGame);
  }

  let handCallback = (roundDone:boolean, newGame:IGame) => {
    copyGame(newGame);
    if (roundDone) {
      calculateScore(newGame);
    }
  }

  let calculateScore = (newGame:IGame) => {
    let newPlayerScores:any[] = [];
    for (let i=0; i<newGame.players.length; i++) {
      let player = newGame.players[i];
      let bid = player.bids[newGame.round-1];
      let hands = player.hands[newGame.round-1];
      let diff = Math.abs(bid - hands)
      let score = diff === 0 ? (POINTS_CORRECT + bid) : 0 - diff;
      player.score += score;

      newPlayerScores.push({name: player.name, score:score, totalScore: player.score});
      setPlayerScores(newPlayerScores);
      console.log("PLAYER_SCORES", newPlayerScores);
    }
    setGame({...newGame});
    setEndOfRound(true);
  }

  let closeDialog = () => {
    setEndOfRound(false);
    nextRound();
  }

  let closeExitDialog = () => {
    setExitDialog(false);
  }

  let endGameDialog = () => {
    setExitDialog(true);
  }

  let endGame = () => {
    setGameOver(true);
  }

  let addPlayer = () => {
    if (!game || !newPlayerName.trim()) return;
    const minScore = Math.min(...game.players.map((p: IPlayer) => p.score));
    const newPlayer: IPlayer = {
      name: newPlayerName.trim(),
      score: minScore,
      bids: Array(game.round - 1).fill(0),
      hands: Array(game.round - 1).fill(0),
      zeroBids: 0
    };
    const newPlayers = [...game.players];
    newPlayers.splice(newPlayerSeat, 0, newPlayer);
    const newMaxCards = (TOTAL_CARDS / newPlayers.length >> 0);
    const clampedCards = Math.min(game.cardsInRound, newMaxCards);
    const dealerName = game.dealer.name;
    const playerToStartName = game.playerToStart.name;
    const playerToBidName = game.playerToBid.name;
    const updatedGame: IGame = {
      ...game,
      players: newPlayers,
      maxCards: newMaxCards,
      cardsInRound: clampedCards,
      maxReached: game.maxReached || clampedCards >= newMaxCards,
      dealer: newPlayers.find(p => p.name === dealerName) ?? newPlayers[0],
      playerToStart: newPlayers.find(p => p.name === playerToStartName) ?? newPlayers[0],
      playerToBid: newPlayers.find(p => p.name === playerToBidName) ?? newPlayers[0],
    };
    setNewPlayerName('');
    setNewPlayerSeat(0);
    setAddPlayerDialog(false);
    copyGame(updatedGame);
  }

  let goBack = () => {
    console.log('UNDO');
    console.log('history 1', [...history]);
    history.pop();  // current Game
    let previousGame = history.pop();
    copyGame(previousGame);
  }

  let content:any;
  if (!game) {
    content = (
        <Player onSubmit={initPlayers}/>
    );
  } else if (gameOver) {
    let sortedPlayers = [...game.players];
    sortedPlayers.sort((a, b) => a.score > b.score ? -1: 1);
    content = (
      <div className='gameover_container'>
        <div className='gameover_inner_container'>
          <h1>Game Over</h1>
          {
            sortedPlayers.map((player:IPlayer, idx:number) => (
              <h2 key={idx}>
                  <span>{player.name}: {player.score}</span>
              </h2>
            ))
          }
          <div><ToggleButton fullWidth={true} value={'newGame'} onClick={newGame} ><h3>Start New Game</h3></ToggleButton></div>
        </div>
      </div>
    );
  } else {
    content = (
      <div>
        <AppBar position="static" color="transparent">
        <Toolbar>
          <FavoriteTwoToneIcon />
          <h3 className="toolbar_title">Chinees Poepen</h3>
          <IconButton disabled={ history.length === 1 } onClick={goBack}><UndoTwoToneIcon /></IconButton>
          <IconButton disabled={ game.gameState !== STATE_DEALING } onClick={() => { setNewPlayerSeat(game.players.length); setAddPlayerDialog(true); }}><PersonAddTwoToneIcon /></IconButton>
          <IconButton onClick={endGameDialog}><LogoutTwoToneIcon /></IconButton>
        </Toolbar>
      </AppBar>
      <div>&nbsp;</div>
        {
          game ?
            <div>
              <ScoreBoard game={game} />
              <div>
                <Grid className="overview_container" container spacing={2}>
                  <Grid className="overview_item left" xs={4}>Round: {game.round}</Grid>
                  <Grid className="overview_item right" xs={8}>Dealer: {game.dealer.name}</Grid>
                  <Grid className="overview_item left" xs={6}>Max cards: {game.maxCards}</Grid>
                  { game.gameState === STATE_PLAYING? <Grid className="overview_item right" xs={6}>Total Bids: {game.roundTotalBids}/{game.cardsInRound}</Grid>:null }
                </Grid>
                { game.gameState === STATE_DEALING ?<Deal game={game} callback={dealtCallback} />:null }
                { game.gameState === STATE_BIDDING ?<Bid game={game} callback={bidCallback} />:null }
                { game.gameState === STATE_PLAYING ?<Hand game={game} callback={handCallback} />:null }
                <Dialog open={endOfRound} onClose={closeDialog}>
                  <DialogTitle>End of round {game.round}</DialogTitle>
                  <DialogContent>
                    <h2>Current Ranking</h2>
                      {
                        [...playerScores].sort((a: any, b: any) => b.totalScore - a.totalScore).map((player:any, idx:number) => (
                          <h3 key={idx}>
                              <span>{idx + 1}. {player.name}: {player.totalScore} ({player.score >=0 ? "+":""}{player.score})</span>
                          </h3>
                        ))
                      }
                  </DialogContent>
                </Dialog>
                <Dialog open={addPlayerDialog} onClose={() => setAddPlayerDialog(false)}>
                  <DialogTitle>Add Player</DialogTitle>
                  <DialogContent>
                    <TextField
                      autoFocus
                      label="Player name"
                      fullWidth
                      value={newPlayerName}
                      onChange={e => setNewPlayerName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addPlayer(); }}
                      sx={{ mt: 1 }}
                    />
                    <Select
                      fullWidth
                      value={newPlayerSeat}
                      onChange={e => setNewPlayerSeat(Number(e.target.value))}
                      sx={{ mt: 2 }}
                    >
                      <MenuItem value={0}>At the start</MenuItem>
                      {game.players.map((p: IPlayer, idx: number) => (
                        <MenuItem key={idx} value={idx + 1}>After {p.name}</MenuItem>
                      ))}
                    </Select>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setAddPlayerDialog(false)}>Cancel</Button>
                    <Button disabled={!newPlayerName.trim()} onClick={addPlayer}>Add</Button>
                  </DialogActions>
                </Dialog>
                <Dialog open={exitDialog} onClose={closeExitDialog}>
                  <DialogTitle>End game?</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      <div>Are you sure you want to end the game?</div>
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button autoFocus onClick={closeExitDialog}>No, keep playing</Button>
                    <Button onClick={endGame}>Yes, fuck this shit</Button>
                  </DialogActions>
                </Dialog>
              </div>
            </div>
          :null
        }
      </div>
    );
  }
  return (
    <Container maxWidth="lg" className="App">
      {content}
    </Container>
  );
}

export default App;
