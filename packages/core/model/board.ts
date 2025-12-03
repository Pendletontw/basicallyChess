import { Bishop, King, Knight, Pawn, Piece, Queen, Rook } from './piece';
import { BISHOP, BOARD_SIZE, CastleTypes, Color, KING, KNIGHT, PAWN, PieceRepresentation, QUEEN, ROOK, SQUARES } from './constants';
import { Move } from './move';

export class Board {
    public readonly pieces: (Piece | null)[] = new Array(BOARD_SIZE).fill(null);

    constructor(initialPieces: Piece[] = []) {
        for (const piece of initialPieces) {
            this.pieces[piece.position] = piece;
        }
    }

    public place(representation: PieceRepresentation, color: Color, position: number, firstMove?: boolean): void {
        switch(representation) {
            case PAWN:
                this.pieces[position] = new Pawn(color, position, firstMove);
                break;
            case KNIGHT:
                this.pieces[position] = new Knight(color, position);
                break;
            case BISHOP:
                this.pieces[position] = new Bishop(color, position);
                break;
            case ROOK:
                this.pieces[position] = new Rook(color, position, firstMove);
                break;
            case QUEEN:
                this.pieces[position] = new Queen(color, position);
                break;
            case KING:
                this.pieces[position] = new King(color, position, firstMove);
        }
    }

    public remove(position: number) {
        delete this.pieces[position];
        this.pieces[position] = null;
    }

    public move(move: Move): void {
        if(move.flags.castle) 
            this._castle(move.piece.color, move.flags.castle);

        this.movePiece(move.start, move.end);
    }

    public movePiece(from: number, to: number): void {
        this.pieces[to] = this.pieces[from];
        if(this.pieces[to] !== null) {
            this.pieces[to].firstMove = false;
            this.pieces[to].position = to;
        }

        delete this.pieces[from];
        this.pieces[from] = null;
    }

    public moveAndReplace(from: number, to: number, piece: Piece): void {
        this.pieces[to] = piece;

        delete this.pieces[from];
        this.pieces[from] = null;
    }

    private _castle(color: Color, castle: CastleTypes) {
        if(castle === CastleTypes.KingSide) {
            this._castleKingSide(color);
        }

        if(castle === CastleTypes.QueenSide) {
            this._castleQueenSide(color);
        }
    }

    private _castleKingSide(color: Color) {
        if(color === Color.White) {
            this.movePiece(SQUARES.h1, SQUARES.f1);
        }
        else {
            this.movePiece(SQUARES.h8, SQUARES.f8);
        }
    }

    private _castleQueenSide(color: Color) {
        if(color === Color.White) {
            this.movePiece(SQUARES.a1, SQUARES.d1);
        }
        else {
            this.movePiece(SQUARES.a8, SQUARES.d8);
        }
    }

    public undoCastle(color: Color, castle: CastleTypes) {
        if(castle === CastleTypes.KingSide) {
            this._undoCastleKingSide(color);
        }

        if(castle === CastleTypes.QueenSide) {
            this._undoCastleQueenSide(color);
        }
    }


    private _undoCastleKingSide(color: Color) {
        if(color === Color.White) {
            this.movePiece(SQUARES.f1, SQUARES.h1);
            const rook = this.pieces[SQUARES.h1];
            if(rook)
                rook.firstMove = true;
        }
        else {
            this.movePiece(SQUARES.f8, SQUARES.h8);
            const rook = this.pieces[SQUARES.h8];
            if(rook)
                rook.firstMove = true;
        }
    }

    private _undoCastleQueenSide(color: Color) {
        if(color === Color.White) {
            this.movePiece(SQUARES.d1, SQUARES.a1);
            const rook = this.pieces[SQUARES.a1];
            if(rook)
                rook.firstMove = true;
        }
        else {
            this.movePiece(SQUARES.d8, SQUARES.a8);
            const rook = this.pieces[SQUARES.a8];
            if(rook)
                rook.firstMove = true;
        }
    }

    public toString(): string {
        let isWhiteSquare: boolean = false;
        let builder: string = "  ┌─────────────────┐\n";

        for (let rank = 7; rank >= 0; rank--) {
            for (let file = 0; file < 8; file++) {
                if(file === 0) builder += (rank + 1).toString() + " │ ";
                const index = rank * 8 + file;
                const piece = this.pieces[index];

                if (piece) {
                    builder += `${piece.toString()} `;
                } else {
                    builder += isWhiteSquare ? '□' : `■`;
                    builder += " ";
                }
                isWhiteSquare = !isWhiteSquare;
            }
            isWhiteSquare = !isWhiteSquare;
            builder += "│\n";
        }
        builder += "  └─────────────────┘\n";
        builder += "    a b c d e f g h";
        return builder;
    }
}
