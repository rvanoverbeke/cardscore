import IPlayer from "./IPlayer"

export default interface IGame {
    players: IPlayer[],
    maxCards: number,
    maxReached: boolean,
    round: number,
    cardsInRound: number,
    roundTotalBids: number,
    roundCurrentHand: number,
    dealer: IPlayer,
    playerToStart: IPlayer,
    playerToBid: IPlayer,
    gameState: string
}