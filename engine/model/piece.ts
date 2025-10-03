import { Color, Direction, Pieces,  } from './constants';
import { Board } from './board';
import { Move } from './move';
import { isBishopExclusionTile, isKingExclusionTile, isKnightExclusionTile, isPawnExclusionTile, isQueenExclusionTile, isRookExclusionTile, isTileOnBoard } from '../utils/board-utils';

export abstract class Piece {
    public readonly color: Color;
    public position: number;
    public abstract representation(): Pieces;
    public abstract readonly offsets: number[];
    public firstMove: boolean = true;

    public abstract legalMoves(board: Board): Move[];

    constructor(color: Color, position: number, firstMove: boolean = true) {
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
            if(isPawnExclusionTile(this.position, offset * this.direction)) 
                continue;

            let targetPosition = this.position + (offset * this.direction);
            if(!isTileOnBoard(targetPosition))
                continue;

            if(offset == 16) {
                if(this.firstMove == false) 
                    continue;

                let betweenTile = this.position + (this.direction * 8);
                if(board.pieces[betweenTile] !== null) 
                    continue;

                if(board.pieces[targetPosition] !== null) 
                    continue;

                let move: Move = new Move(this.position, targetPosition);
                moves.push(move);

            }

            // attack square has opposing piece?
            else if(offset == 7 || offset == 9) {
                let targetSquare = board.pieces[targetPosition];

                if(targetSquare != null && targetSquare.color != this.color) {
                    let move: Move = new Move(this.position, targetPosition);
                    moves.push(move);
                }
            }
            else {
                if(board.pieces[targetPosition] == null) {
                    let move: Move = new Move(this.position, targetPosition);
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

    public legalMoves(board: Board): Move[] {
        let moves: Move[] = [];

        for(let offset of this.offsets) {
            let targetPosition = this.position + (offset * this.direction);

            if(!isTileOnBoard(targetPosition)) 
                continue;

            if(isKnightExclusionTile(this.position, offset))
                continue;

            const piece: Piece | null = board.pieces[targetPosition];
            if(piece !== null && piece.color === this.color) 
                continue;

            let move: Move = new Move(this.position, targetPosition);
            moves.push(move);
        }

        return moves;
    }

    public representation(): Pieces {
        return Pieces.Knight;
    }
}

export class Bishop extends Piece {
    public static readonly BISHOP_OFFSETS: number[] = [
        Direction.NorthEast, 
        Direction.SouthEast, 
        Direction.SouthWest,
        Direction.NorthWest
    ];
    public readonly offsets: number[] = Bishop.BISHOP_OFFSETS;

    constructor(color: Color, position: number) {
        super(color, position);
    }

    public legalMoves(board: Board): Move[] {
        let moves: Move[] = [];

        for(let offset of this.offsets) {
            let targetPosition = this.position;

            while(isTileOnBoard(targetPosition)) {
                if(isBishopExclusionTile(targetPosition, offset))
                    break;

                targetPosition += offset;

                if(!isTileOnBoard(targetPosition)) 
                    break;

                const targetPiece: Piece | null = board.pieces[targetPosition];
                if(targetPiece !== null && targetPiece.color === this.color) 
                    break;

                if(targetPiece !== null && targetPiece.color !== this.color) {
                    let move: Move = new Move(this.position, targetPosition);
                    moves.push(move);
                    break;
                }

                let move: Move = new Move(this.position, targetPosition);
                moves.push(move);
            }
        }
        return moves;
    }

    representation() {
        return Pieces.Bishop;
    }
}

export class Rook extends Piece {
    public static readonly ROOK_OFFSETS: number[] = [
        Direction.North, 
        Direction.East, 
        Direction.South, 
        Direction.West
    ];
    public readonly offsets: number[] = Rook.ROOK_OFFSETS;
    constructor(color: Color, position: number) {
        super(color, position);
    }
    public legalMoves(board: Board): Move[] {
        let moves: Move[] = [];
        for(let offset of this.offsets) {
            let targetPosition = this.position;

            while(isTileOnBoard(targetPosition)) {
                if(isRookExclusionTile(targetPosition, offset))
                    break;

                targetPosition += offset;
                if(!isTileOnBoard(targetPosition)) 
                    break;

                const targetPiece: Piece | null = board.pieces[targetPosition];
                if(targetPiece !== null && targetPiece.color === this.color) 
                    break;

                if(targetPiece !== null && targetPiece.color !== this.color) {
                    let move: Move = new Move(this.position, targetPosition);
                    moves.push(move);
                    break;
                }

                let move: Move = new Move(this.position, targetPosition);
                moves.push(move);
            }
        }
        return moves;
    }

    representation() {
        return Pieces.Rook;
    }
}

export class Queen extends Piece {
    public static readonly QUEEN_OFFSETS = [
        Direction.North,
        Direction.NorthEast,
        Direction.East,
        Direction.SouthEast,
        Direction.South,
        Direction.SouthWest,
        Direction.West,
        Direction.NorthWest,
    ];
    public readonly offsets: number[] = Queen.QUEEN_OFFSETS;
    constructor(color: Color, position: number) {
        super(color, position);
    }

    public legalMoves(board: Board): Move[] {
        let moves: Move[] = [];
        for(let offset of this.offsets) {
            let targetPosition = this.position;

            while(isTileOnBoard(targetPosition)) {
                if(isQueenExclusionTile(targetPosition, offset))
                    break;

                targetPosition += offset;

                if(!isTileOnBoard(targetPosition)) 
                    break;

                const targetPiece: Piece | null = board.pieces[targetPosition];
                if(targetPiece !== null && targetPiece.color === this.color) 
                    break;

                if(targetPiece !== null && targetPiece.color !== this.color) {
                    let move: Move = new Move(this.position, targetPosition);
                    moves.push(move);
                    break;
                }

                let move: Move = new Move(this.position, targetPosition);
                moves.push(move);
            }
        }
        return moves;
    }
    representation() {
        return Pieces.Queen;
    }
}

export class King extends Piece {
    public static readonly KING_OFFSETS = [
        Direction.North,
        Direction.NorthEast,
        Direction.East,
        Direction.SouthEast,
        Direction.South,
        Direction.SouthWest,
        Direction.West,
        Direction.NorthWest,
    ];
    public readonly offsets: number[] = King.KING_OFFSETS;
    constructor(color: Color, position: number) {
        super(color, position);
    }

    public legalMoves(board: Board): Move[] {
        let moves: Move[] = [];
        for(let offset of this.offsets) {
            if(isKingExclusionTile(this.position, offset))
                continue;

            let targetPosition = this.position + offset;
            if(!isTileOnBoard(targetPosition)) 
                continue;

            const targetPiece: Piece | null = board.pieces[targetPosition];
            if(targetPiece !== null && targetPiece.color === this.color) 
                continue;

            let move: Move = new Move(this.position, targetPosition);
            moves.push(move);
        }
        return moves;
    }

    representation() {
        return Pieces.King;
    }
}
