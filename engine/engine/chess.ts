import { Board } from "../model/board";
import { Castles, Color, DECIMAL, DEFAULT_POSITION, NEXT_RANK, PieceRepresentation, Square, SQUARES } from "../model/constants";

export default class Chess {

    public board: Board = new Board();
    public turn: Color = Color.White;
    public castles: Castles = { 
        "W": { "queen": false, "king": false}, 
        "B": { "queen": false, "king": false} 
    };

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
        const [positions, color, castling, nonpassant, clock, moves] = tokens;

        let position = 0;
        for(let character of positions) {
            // A forward slash represents moving on to the next line. In this case,
            // move the position up one rank. This is already covered with our other logic.
            if(character === '/')
                continue;

            // If the character is a number, it represents the spaces between the pieces
            // move the position forward as indicated to evaluate the next piece
            if("123456789".includes(character)) {
                position += parseInt(character, DECIMAL);
            }

            // If it is neither, that means it is a piece representation. Build out the
            // board with indicated pieces and move on to the next position to evaluate.
            else {
                const color = character === character.toUpperCase() ? Color.White : Color.Black;
                this.board.place(character.toLowerCase() as PieceRepresentation, color, position);
                position++;
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
}
