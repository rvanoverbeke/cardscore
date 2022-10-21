import IPlayer from "../types/IPlayer";

function getNextPlayer(players:IPlayer[], player: IPlayer) {
    let idx = players.indexOf(player);
    if (++idx === players.length) {
        idx = 0;
    }
    return players[idx];
}

export default getNextPlayer;