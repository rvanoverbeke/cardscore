import { AppBar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, ToggleButton, Toolbar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import './App.scss';
import Deal from './components/deal/Deal';
import Player from './components/player/Player';
import Bid from './components/bid/Bid';
import ScoreBoard from './components/scoreboard/ScoreBoard';
import getNextPlayer from './lib/helpers/helpers';
import IGame from './lib/types/IGame';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import FavoriteTwoToneIcon from '@mui/icons-material/FavoriteTwoTone';
import UndoTwoToneIcon from '@mui/icons-material/UndoTwoTone';

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

  const [game, setGame] = useState<IGame|undefined>(undefined);
  const [history, setHistory] = useState<(IGame|undefined)[]>([]);
  const [endOfRound, setEndOfRound] = useState(false);
  const [exitDialog, setExitDialog] = useState(false);
  const [playerScores, setPlayerScores] = useState<any>([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    console.log('History:', history.length, [...history]);
  }, [history]);

  let initPlayers = (playerNames: string[], dealer: number) => {
    let newPlayers:IPlayer[] = [];
    playerNames.forEach(playerName => {
      newPlayers.push({name: playerName, score: 0, bids: [], hands: []})
    });
    startGame(newPlayers, dealer);
  }

  let newGame = () => {
    setGame(undefined);
    setHistory([]);
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
    console.log(newGame);
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

  let bidCallback = (biddingDone:false, newGame:IGame) => {
    if (biddingDone) {
      console.log("Bidding done");
      newGame.gameState = STATE_PLAYING;
    }
    copyGame(newGame);
  }

  let handCallback = (roundDone:false, newGame:IGame) => {
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
      
      newPlayerScores.push({name: player.name, score:score});
      setPlayerScores(newPlayerScores);
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
      <div>
        <h1>Game Over</h1>
        {
          sortedPlayers.map((player:IPlayer, idx:number) => (
            <h2 key={idx} className='gameover_container'>
                <span>{player.name}: {player.score}</span>
            </h2>
          ))
        }
        <div><ToggleButton fullWidth={true} value={'newGame'} onClick={newGame} ><h3>Start New Game</h3></ToggleButton></div>
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
          <IconButton onClick={endGameDialog}><CancelTwoToneIcon /></IconButton>
        </Toolbar>
      </AppBar>
      <div>&nbsp;</div>
        {
          game ?
            <div>
              <ScoreBoard game={game} />
              <div>
                <h3>
                  <span>Round: {game.round}</span>
                  <span> | </span>
                  <span>Dealer: {game.dealer.name}</span>
                  <span> | </span>
                  <span>Max cards: {game.maxCards}</span>
                </h3>
                { game.gameState === STATE_DEALING ?<Deal game={game} callback={dealtCallback} />:null }
                { game.gameState === STATE_BIDDING ?<Bid game={game} callback={bidCallback} />:null }
                { game.gameState === STATE_PLAYING ?<Hand game={game} callback={handCallback} />:null }
                <Dialog open={endOfRound} onClose={closeDialog}>
                  <DialogTitle>End of round {game.round}</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      {
                        playerScores.map((player:any, idx:number) => (
                          <h2 key={idx}>
                              <span>{player.name}: {player.score}</span>
                          </h2>
                        ))
                      }
                    </DialogContentText>
                  </DialogContent>
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
