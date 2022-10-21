import IPlayer from "./IPlayer"

export default interface IGame {
    players: IPlayer[],
    maxCards: number,
    round: number,
    cardsInRound: number,
    maxReached: boolean,
    dealer: IPlayer,
    startPlayer: IPlayer
}