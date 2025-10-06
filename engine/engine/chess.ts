import { Board } from "../model/board";
import { Castles, Color, DECIMAL, DEFAULT_POSITION, KING, Kings, PieceRepresentation, Square, SQUARES } from "../model/constants";
import { Piece } from "../model/piece";

export default class Chess {

    public board: Board = new Board();
    public turn: Color = Color.White;
    public castles: Castles = { 
        "W": { "queen": false, "king": false}, 
        "B": { "queen": false, "king": false} 
    };

    public kings: Kings = {
        "W": -1,
        "B": -1
    }

    public nonpassant: number | null = null;

    // " The number of halfmoves since the last capture or pawn advance, used for the fifty-move rule"
    public halves: number = 0;
    public moves: number = 0;

    constructor(fen = DEFAULT_POSITION) {
        this.loadFEN(fen);
    }

    // https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
    public loadFEN(fen: string): void {
        const tokens: string[] = fen.split(/\s+/)
        const [pieces, color, castling, nonpassant, clock, moves] = tokens;

        let position = SQUARES.a1;
        for(let positions of pieces.split("/").reverse()) {
            for(let character of positions) {
                // If the character is a number, it represents the spaces between the pieces
                // move the position forward as indicated to evaluate the next piece
                if("123456789".includes(character)) {
                    position += parseInt(character, DECIMAL);
                }

                // If it is neither, that means it is a piece representation. Build out the
                // board with indicated pieces and move on to the next position to evaluate.
                else {
                    const color = character === character.toUpperCase() ? Color.White : Color.Black;
                    this._place(character.toLowerCase() as PieceRepresentation, color, position);
                    position++;
                }
            }
        }

        this.turn = color === "w" ? Color.White : Color.Black;

        this.castles[Color.White].king = castling.includes("K");
        this.castles[Color.White].queen = castling.includes("Q");
        this.castles[Color.Black].king = castling.includes("k");
        this.castles[Color.Black].queen = castling.includes("q");

        this.nonpassant = nonpassant === "-" ? null : SQUARES[nonpassant as Square];

        this.halves = parseInt(clock, DECIMAL);
        this.moves = parseInt(moves, DECIMAL);
    }

    private _place(piece: PieceRepresentation, color: Color, position: number) {
        if(piece === KING) {
            this.kings[color] = position;
        }
        this.board.place(piece, color, position);

    }

    public switchTurns(): void {
        this.turn = this.turn === Color.White ? Color.Black : Color.White;
    }

    public move(from: Square, to: Square): void {
        let current: number = SQUARES[from];
        let target: number = SQUARES[to];
        let piece: Piece | null = this.board.pieces[current];
        if(piece === null) 
            throw Error("Not a valid square!");

        if(piece.color !== this.turn) 
            throw Error("Not your piece!");

        for(let move of piece.legalMoves(this.board)) {
            if(move.start === current && move.end === target) {
                if(piece.representation() === KING) 
                    this.kings[piece.color] = target;

                this.board.movePiece(current, target);
                this.switchTurns();
                return;
            }
        }

        throw Error("Not legal move!");
    }

    public isCheckmate(): boolean {
        return false;
    }
}
