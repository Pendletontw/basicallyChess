import { Piece } from './piece';
import { BOARD_SIZE } from './constants';

export class Board {
    public readonly pieces: (Piece | null)[] = new Array(BOARD_SIZE).fill(null);

    constructor(initialPieces: Piece[]) {
        for (const piece of initialPieces) {
            this.pieces[piece.position] = piece;
        }
    }

    public toString(): string {
        let isWhiteSquare: boolean = false;
        let builder: string = "";

        for (let rank = 7; rank >= 0; rank--) {
            for (let file = 0; file < 8; file++) {
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
            if (rank > 0) {
                builder += "\n";
            }
        }
        console.log(builder);
        return builder;
    }
}
