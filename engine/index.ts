import { DEFAULT_POSITION } from './model/constants';
import Chess from './engine/chess';
import { Game } from './game/game';

function main() {
  //const chess: Chess = new Chess(DEFAULT_POSITION);
  //chess.board.toString();
    const game: Game = new Game();
    game.start();

  // const engine = new MinMaxEngine();
  // const bestMove = engine.findBestMove(board);
}

main();


// _ _ _ _ _ _ _ =
// = _ _ _ _ _ = _
// _ = _ _ _ = _ _
// _ _ = _ = _ _ _
// _ _ _ b _ _ _ _
// _ _ . _ . _ _ _
// _ _ _ _ _ _ _ _
// _ _ _ _ _ _ _ _
