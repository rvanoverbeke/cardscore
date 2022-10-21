import { AppBar, BottomNavigation, BottomNavigationAction, Button, Dialog, DialogContent, DialogContentText, DialogTitle, IconButton, ToggleButton, Toolbar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import './App.scss';
import Deal from './components/deal/Deal';
import Player from './components/player/Player';
import Bid from './components/bid/Bid';
import ScoreBoard from './components/scoreboard/ScoreBoard';
import getNextPlayer from './lib/helpers/helpers';
import IGame from './lib/types/IGame';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import FavoriteTwoToneIcon from '@mui/icons-material/FavoriteTwoTone';

import IPlayer from './lib/types/IPlayer';
import Hand from './components/hand/Hand';
import { Container } from '@mui/system';

function App() {
  const TOTAL_CARDS = 51; // 52 cards, but we need to always have at least one extra for trump
  const STARTING_CARDS = 3;
  const POINTS_CORRECT = 5;

  const [game, setGame] = useState<IGame|undefined>(undefined);
  const [dealingOpen, setDealingOpen] = useState(false);
  const [biddingOpen, setBiddingOpen] = useState(false);
  const [handsOpen, setHandsOpen] = useState(false);
  const [endOfRound, setEndOfRound] = useState(false);
  const [playerScores, setPlayerScores] = useState<any>([]);
  const [gameOver, setGameOver] = useState(false);

  let initPlayers = (playerNames: string[], dealer: number) => {
    let newPlayers:IPlayer[] = [];
    playerNames.forEach(playerName => {
      newPlayers.push({name: playerName, score: 0, bids: [], hands: []})
    });
    startGame(newPlayers, dealer);
  }

  let endGame = () => {
    setGameOver(true);
  }

  let newGame = () => {
    setGame(undefined);
    setGameOver(false);
    setBiddingOpen(false);
    setHandsOpen(false);
  }


  let startGame = (players: IPlayer[], dealerIdx: number) => {
    let startPlayerIdx = dealerIdx + 1;
    if (startPlayerIdx >= players.length) {
      startPlayerIdx = 0;
    }
    let maxCards = (TOTAL_CARDS / players.length >> 0);
    let newGame:IGame = {
      players: players,
      maxCards: maxCards,
      round: 1,
      cardsInRound: STARTING_CARDS,
      maxReached: false,
      dealer: players[dealerIdx],
      startPlayer: players[startPlayerIdx]
    }
    setGame(newGame);
    setDealingOpen(true);
    setBiddingOpen(false);
    setHandsOpen(false);
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
    newGame.dealer = getNextPlayer(newGame);
    newGame.startPlayer = getNextPlayer(newGame, newGame.dealer);
    console.log('dealer', newGame.dealer);
    console.log('startPlayer', newGame.startPlayer);
    if (newGame.cardsInRound === newGame.maxCards) {
      newGame.maxReached = true;
    }
    if (newGame.maxReached) {
      newGame.cardsInRound--;
    } else {
      newGame.cardsInRound++;
    }
    console.log(newGame);
    setGame(newGame);
    setDealingOpen(true);
    setBiddingOpen(false);
    setHandsOpen(false);
  }

  let dealtCallback = () => {
    setDealingOpen(false);
    setBiddingOpen(true);
    setHandsOpen(false);
  }


  let bidCallback = (biddingDone:false, newGame:IGame) => {
    setGame({...newGame});
    if (biddingDone) {
      console.log("Bidding done");
      setBiddingOpen(false);
      setHandsOpen(true);
    }
  }

  let handCallback = (roundDone:false, newGame:IGame) => {
    setGame({...newGame});
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
      console.log(player.name, bid, hands, diff, score);
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
          <Button variant="outlined" onClick={endGame} size="large" startIcon={<CancelTwoToneIcon />}>End Game</Button>
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
                { dealingOpen ?<Deal game={game} callback={dealtCallback} />:null }
                { biddingOpen ?<Bid game={game} callback={bidCallback} />:null }
                { handsOpen ?<Hand game={game} callback={handCallback} />:null }
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
