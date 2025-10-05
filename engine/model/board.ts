import { Bishop, King, Knight, Pawn, Piece, Queen, Rook } from './piece';
import { BISHOP, BOARD_SIZE, Color, KING, KNIGHT, PAWN, PieceRepresentation, QUEEN, ROOK } from './constants';

export class Board {
    public readonly pieces: (Piece | null)[] = new Array(BOARD_SIZE).fill(null);

    constructor(initialPieces: Piece[] = []) {
        for (const piece of initialPieces) {
            this.pieces[piece.position] = piece;
        }
    }

    public place(representation: PieceRepresentation, color: Color, position: number): void {
        switch(representation) {
            case PAWN:
                this.pieces[position] = new Pawn(color, position);
                break;
            case KNIGHT:
                this.pieces[position] = new Knight(color, position);
                break;
            case BISHOP:
                this.pieces[position] = new Bishop(color, position);
                break;
            case ROOK:
                this.pieces[position] = new Rook(color, position);
                break;
            case QUEEN:
                this.pieces[position] = new Queen(color, position);
                break;
            case KING:
                this.pieces[position] = new King(color, position);
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
        console.log(builder);
        return builder;
    }
}
