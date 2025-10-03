import { Color, Pieces,  } from './constants';
import { Board } from './board';
import { Move } from './move';
import { isSquareOnBoard } from '../utils/board-utils';

export abstract class Piece {
    public readonly color: Color;
    public position: number;
    public abstract representation(): Pieces;
    public abstract readonly offsets: number[];
    public firstMove: Boolean = true;

    public abstract legalMoves(board: Board): Move[];

    constructor(color: Color, position: number, firstMove = true) {
        this.color = color;
        this.position = position;
        this.firstMove = firstMove;
        
    }


    get direction(): number {
        return this.color == Color.Black ? -1 : 1;
    }

    public toString(): string {
        if (this.color === Color.Black) {
            return this.representation();
        }
        return this.representation().toUpperCase();
    }
}

export class Pawn extends Piece {
    public static readonly PAWN_OFFSETS: number[] = [8, 16, 7, 9];
    public readonly offsets: number[] = Pawn.PAWN_OFFSETS;
    

    constructor(color: Color, position: number, firstMove = true) {
        super(color, position, firstMove);
        
    }

    public legalMoves(board: Board): Move[] {
        let moves: Move[] = [];

        for(let offset of this.offsets) {
            let current_position = this.position + (offset * this.direction);
            
            if (!isSquareOnBoard(current_position)) {
                continue;
            }
            // square occupied? 
            
            if (offset == 16) {
                let betweenTile = this.position + (this.direction * 8);
                // piece in way?

                if (this.firstMove == false) {
                    continue;
                }
                if (board.pieces[betweenTile] != null) {
                    continue;
                }
                if (board.pieces[current_position] != null) {
                    continue;
                }

                let move: Move = new Move(this.position, current_position);
                moves.push(move);

            }

            // attack square has opposing piece?
            else if (offset == 7 || offset == 9) {
                let targetSquare = board.pieces[current_position];

                if (targetSquare != null && targetSquare.color != this.color) {
                    let move: Move = new Move(this.position, current_position);
                    moves.push(move);

                }
            }
            else {
                if (board.pieces[current_position] == null) {
                    let move: Move = new Move(this.position, current_position);
                    moves.push(move);
                }

            }

        }
        
        return moves;
    }

    public representation(): Pieces {
        return Pieces.Pawn;
    }
}

export class Knight extends Piece {
    public static readonly KNIGHT_OFFSETS: number[] = [-17, -15, -10, -6, 6, 10, 15, 17];
    public readonly offsets: number[] = Knight.KNIGHT_OFFSETS;

    constructor(color: Color, position: number) {
        super(color, position);
    }
    // knight lowkey teleport if at pos 0 and +6 and 15 offset
    // 1st 2nd 7th and 8th file are affected

    public legalMoves(board: Board): Move[] {
        let moves: Move[] = [];

        for(let offset of this.offsets) {
            let current_position = this.position + (offset * this.direction);

            if (!isSquareOnBoard(current_position)) {
                continue;
            } 
            let move: Move = new Move(this.position, current_position);
            moves.push(move);
             
        }

        return moves;
    }

    public representation(): Pieces {
        return Pieces.Knight;
    }
}

export class Bishop extends Piece {
    public static readonly BISHOP_OFFSETS: number[] = [-9, -7, 7, 9];
    public readonly offsets: number[] = Bishop.BISHOP_OFFSETS;

    constructor(color: Color, position: number) {
        super(color, position);
    }
    public legalMoves(board: Board): Move[] {
            let moves: Move[] = [];

            // bishop lowkey teleport if at pos 0 and +7 offset
            // 1st and 8th lowkey zooted off the fent fr

            for(let offset of this.offsets) {
                let current_position = this.position + (offset * this.direction);
                
                if (!isSquareOnBoard(current_position)) {
                    continue;
                }

                while (board.pieces[current_position] == null) {
                    let move: Move = new Move(this.position, current_position);
                    moves.push(move);
                    current_position += offset * this.direction;

                }

            }
            return moves;
        }

    representation() {
        return Pieces.Bishop;
    }
}

export class Rook extends Piece {
    public static readonly ROOK_OFFSETS: number[] = [-8, -1, 1, 8];
    public readonly offsets: number[] = Rook.ROOK_OFFSETS;
    constructor(color: Color, position: number) {
        super(color, position);
    }
    public legalMoves(board: Board): Move[] {
        let moves: Move[] = [];
        return moves;
    }
    representation() {
        return Pieces.Rook;
    }
}

export class Queen extends Piece {
    public static readonly QUEEN_OFFSETS = [-9, -8, -7, -1, 1, 7, 8, 9];
    public readonly offsets: number[] = Queen.QUEEN_OFFSETS;
    constructor(color: Color, position: number) {
        super(color, position);
    }

    public legalMoves(board: Board): Move[] {
        let moves: Move[] = [];
        return moves;
    }
    representation() {
        return Pieces.Queen;
    }
}

export class King extends Piece {
    public static readonly KING_OFFSETS = [-9, -8, -7, -1, 1, 7, 8, 9];
    public readonly offsets: number[] = King.KING_OFFSETS;
    constructor(color: Color, position: number) {
        super(color, position);
    }

    public legalMoves(board: Board): Move[] {
        let moves: Move[] = [];
        return moves;
    }
    representation() {
        return Pieces.King;
    }
}
