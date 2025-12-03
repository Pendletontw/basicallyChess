import { CastleTypes, Color, Direction, Flags, PawnJump, PieceRepresentation, Pieces, PromotionPiece, Rank, SQUARES,  } from './constants';
import { Move } from './move';
import { canCastle, getRank, isBishopExclusionTile, isKingExclusionTile, isKnightExclusionTile, isPawnExclusionTile, isQueenExclusionTile, isRookExclusionTile, isTileOnBoard } from '../utils/board-utils';
import Chess from '../engine/chess';

export abstract class Piece {
    public readonly color: Color;
    public position: number;
    public abstract representation(): PieceRepresentation;
    public abstract readonly offsets: number[];
    public firstMove: boolean = true;

    public abstract legalMoves(chess: Chess): Move[];

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
    private readonly promotions: PromotionPiece[] = [Pieces.Queen, Pieces.Rook, Pieces.Bishop, Pieces.Knight];

    constructor(color: Color, position: number, firstMove = true) {
        super(color, position, firstMove);
    }

    public legalMoves(chess: Chess): Move[] {
        let moves: Move[] = [];
        let flags: Flags = { firstMove: this.firstMove };

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
                if(chess.board.pieces[betweenTile] !== null) 
                    continue;

                if(chess.board.pieces[targetPosition] !== null) 
                    continue;

                let move: Move = new Move(this.position, 
                                          targetPosition, 
                                          this,
                                          { ...flags, jump: PawnJump.Long, enpassant: betweenTile });
                moves.push(move);

            }
            else if(offset == 7 || offset == 9) {
                let targetPiece = chess.board.pieces[targetPosition];

                if(targetPiece != null && targetPiece.color != this.color) {
                    const newFlags = { ...flags, captured: targetPiece };
                    const rank = getRank(targetPosition);
                    if(rank === Rank.Eight && this.color === Color.White || 
                       rank === Rank.One && this.color === Color.Black) {
                        for(const promotion of this.promotions) {
                            let move: Move = new Move(this.position, targetPosition, this, { ...newFlags, promotion: promotion });
                            moves.push(move);
                        }
                        continue;
                    }
                    let move: Move = new Move(this.position, targetPosition, this, newFlags);
                    moves.push(move);
                }
                else if(chess.nonpassant === targetPosition) {
                    let piece: Piece | null;
                    if(getRank(targetPosition) === Rank.Six) {
                        piece = chess.board.pieces[targetPosition - 8];

                    } else {
                        piece = chess.board.pieces[targetPosition + 8];
                    }

                    if(piece === null) 
                        continue;

                    if(piece.color === this.color)
                        continue;

                    let move: Move = new Move(this.position, targetPosition, this, { ...flags, captured: piece });
                    moves.push(move);
                }
            }
            else {
                if(chess.board.pieces[targetPosition] == null) {
                    const newFlags = { ...flags, jump: PawnJump.Short };
                    const rank = getRank(targetPosition);
                    if(rank === Rank.Eight && this.color === Color.White || 
                       rank === Rank.One && this.color === Color.Black) {
                        for(const promotion of this.promotions) {
                            let move: Move = new Move(this.position, targetPosition, this, { ...newFlags, promotion: promotion });
                            moves.push(move);
                        }
                        continue;
                    }
                    let move: Move = new Move(this.position, targetPosition, this, newFlags);
                    moves.push(move);
                }
            }
        }
        return moves;
    }

    representation(): PieceRepresentation {
        return Pieces.Pawn;
    }
}

export class Knight extends Piece {
    public static readonly KNIGHT_OFFSETS: number[] = [-17, -15, -10, -6, 6, 10, 15, 17];
    public readonly offsets: number[] = Knight.KNIGHT_OFFSETS;

    constructor(color: Color, position: number) {
        super(color, position);
    }

    public legalMoves(chess: Chess): Move[] {
        let moves: Move[] = [];

        for(let offset of this.offsets) {
            let targetPosition = this.position + offset;

            if(!isTileOnBoard(targetPosition)) 
                continue;

            if(isKnightExclusionTile(this.position, offset))
                continue;

            const targetPiece: Piece | null = chess.board.pieces[targetPosition];
            if(targetPiece !== null && targetPiece.color === this.color) 
                continue;

            let move: Move = new Move(this.position, targetPosition, this, { captured: targetPiece });
            moves.push(move);
        }

        return moves;
    }

    public representation(): PieceRepresentation {
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

    public legalMoves(chess: Chess): Move[] {
        let moves: Move[] = [];

        for(let offset of this.offsets) {
            let targetPosition = this.position;

            while(isTileOnBoard(targetPosition)) {
                if(isBishopExclusionTile(targetPosition, offset))
                    break;

                targetPosition += offset;

                if(!isTileOnBoard(targetPosition)) 
                    break;

                const targetPiece: Piece | null = chess.board.pieces[targetPosition];
                if(targetPiece === null) {
                    let move: Move = new Move(this.position, targetPosition, this);
                    moves.push(move);
                    continue;
                }

                if(targetPiece !== null && targetPiece.color === this.color) 
                    break;

                let move: Move = new Move(this.position, targetPosition, this, { captured: targetPiece});
                moves.push(move);
                break;
            }
        }
        return moves;
    }

    representation(): PieceRepresentation {
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
    constructor(color: Color, position: number, firstMove: boolean = true) {
        super(color, position, firstMove);
    }
    public legalMoves(chess: Chess): Move[] {
        let moves: Move[] = [];
        let flags: Flags = { firstMove: this.firstMove };

        for(let offset of this.offsets) {
            let targetPosition = this.position;

            while(isTileOnBoard(targetPosition)) {
                if(isRookExclusionTile(targetPosition, offset))
                    break;

                targetPosition += offset;
                if(!isTileOnBoard(targetPosition)) 
                    break;

                const targetPiece: Piece | null = chess.board.pieces[targetPosition];
                if(targetPiece === null) {
                    let move: Move = new Move(this.position, targetPosition, this, { ...flags });
                    moves.push(move);
                    continue;
                }

                if(targetPiece.color === this.color) 
                    break;

                let move: Move = new Move(this.position, targetPosition, this, { ...flags, captured: targetPiece });
                moves.push(move);
                break;
            }
        }
        return moves;
    }

    representation(): PieceRepresentation {
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

    public legalMoves(chess: Chess): Move[] {
        let moves: Move[] = [];

        for(let offset of this.offsets) {
            let targetPosition = this.position;

            while(isTileOnBoard(targetPosition)) {
                if(isQueenExclusionTile(targetPosition, offset))
                    break;

                targetPosition += offset;

                if(!isTileOnBoard(targetPosition)) 
                    break;

                const targetPiece: Piece | null = chess.board.pieces[targetPosition];
                if(targetPiece === null) {
                    let move: Move = new Move(this.position, targetPosition, this, { captured: targetPiece });
                    moves.push(move);
                    continue;
                }

                if(targetPiece.color === this.color) 
                    break;

                let move: Move = new Move(this.position, targetPosition, this, { captured: targetPiece });
                moves.push(move);
                break;
            }
        }
        return moves;
    }

    representation(): PieceRepresentation {
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
    constructor(color: Color, position: number, firstMove: boolean = true) {
        super(color, position, firstMove);
    }

    public legalMoves(chess: Chess): Move[] {
        let moves: Move[] = [];
        let flags: Flags = { firstMove: this.firstMove };

        for(let offset of this.offsets) {
            if(isKingExclusionTile(this.position, offset))
                continue;

            let targetPosition = this.position + offset;
            if(!isTileOnBoard(targetPosition)) 
                continue;

            if(canCastle(chess, this.color, CastleTypes.KingSide)) {
                const tile: number = this.color === Color.White ? SQUARES.g1 : SQUARES.g8;
                let move: Move = new Move(this.position, tile, this, { ...flags, castle: CastleTypes.KingSide });
                moves.push(move);
            }

            if(canCastle(chess, this.color, CastleTypes.QueenSide)) {
                const tile: number = this.color === Color.White ? SQUARES.c1 : SQUARES.c8;
                let move: Move = new Move(this.position, tile, this, { ...flags, castle: CastleTypes.QueenSide });
                moves.push(move);
            }

            const targetPiece: Piece | null = chess.board.pieces[targetPosition];
            if(targetPiece !== null && targetPiece.color === this.color) 
                continue;

            let move: Move = new Move(this.position, targetPosition, this, { ...flags, captured: targetPiece });
            moves.push(move);
        }
        return moves;
    }

    representation(): PieceRepresentation {
        return Pieces.King;
    }
}
