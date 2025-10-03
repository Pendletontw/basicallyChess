import { Color } from './model/constants';
import { Board } from './model/board';
import {
  Piece,
  Rook,
  Knight,
  Bishop,
  Queen,
  King,
  Pawn,
} from './model/piece';

function main() {
  const initialPieces: Piece[] = [
    new Rook(Color.White, 0),
    new Knight(Color.White, 1),
    new Bishop(Color.White, 2),
    new Queen(Color.White, 3),
    new King(Color.White, 4),
    new Bishop(Color.White, 5),
    new Knight(Color.White, 6),
    new Rook(Color.White, 7),

    new Pawn(Color.White, 8),
    new Pawn(Color.White, 9),
    new Pawn(Color.White, 10),
    new Pawn(Color.White, 11),
    new Pawn(Color.White, 12),
    new Pawn(Color.White, 13),
    new Pawn(Color.White, 14),
    new Pawn(Color.White, 15),

    new Pawn(Color.Black, 48),
    new Pawn(Color.Black, 49),
    new Pawn(Color.Black, 50),
    new Pawn(Color.Black, 51),
    new Pawn(Color.Black, 52),
    new Pawn(Color.Black, 53),
    new Pawn(Color.Black, 54),
    new Pawn(Color.Black, 55),

    new Rook(Color.Black, 56),
    new Knight(Color.Black, 58), // swapped knight and bishop for testing purposes 
    new Bishop(Color.Black, 57),
    new Queen(Color.Black, 59),
    new King(Color.Black, 60),
    new Bishop(Color.Black, 61),
    new Knight(Color.Black, 62),
    new Rook(Color.Black, 63),
  ];

  const board = new Board(initialPieces);
  console.log(board.pieces[58]?.representation());
  let moves: any = board.pieces[58]?.legalMoves(board);
  for (let move of moves) {
      console.log(move.start, move.end);

  }
  board.toString(); 

  // const engine = new MinMaxEngine();
  // const bestMove = engine.findBestMove(board);
}

main();

// minmax algo
// --------------------------------
// define bishop pair +5
// castling +2
// if you have 3 pawns in front of your king +3
// if you have a lot of avaiable squares toward the middle of the board +3
// pawn 1
// knight 3
// bishop 3.5
// rook 5 
// queen 9
// king 99999
//
// 5 layers deep
//



// for (offset in offsets) {
//  offset == 7
//  current_position = position + offset 
//  if(offset is valid) {
    //  while( current_position + offset is valid and we are in the bounds) {
//          investigate() and add if valid
//
//  }
    //
//  }
//
// }

// _ _ _ _ _ _ _ =
// = _ _ _ _ _ = _
// _ = _ _ _ = _ _
// _ _ = _ = _ _ _
// _ _ _ b _ _ _ _
// _ _ . _ . _ _ _
// _ _ _ _ _ _ _ _
// _ _ _ _ _ _ _ _
