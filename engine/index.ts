import { DEFAULT_POSITION } from './model/constants';
import Chess from './engine/chess';

function main() {
  const chess: Chess = new Chess(DEFAULT_POSITION);
  chess.board.toString();

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
