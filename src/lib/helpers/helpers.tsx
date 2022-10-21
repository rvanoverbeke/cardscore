import IGame from "../types/IGame";
import IPlayer from "../types/IPlayer";

function getNextPlayer(game:IGame, player?: IPlayer) {
    if (!player) {
        player = game.dealer;
    }
    let idx = game.players.indexOf(player);
    if (++idx === game.players.length) {
        idx = 0;
    }
    return game.players[idx];
}

export default getNextPlayer;