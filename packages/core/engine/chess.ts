import { Board } from "../model/board";
import { Castles, CastleTypes, Color, DECIMAL, DEFAULT_POSITION, KING, Kings, PieceRepresentation, Pieces, QUEEN, Square, SQUARES } from "../model/constants";
import { Move } from "../model/move";
import { Pawn, Piece } from "../model/piece";
import { opposite } from "../utils/board-utils";

export default class Chess {
    public board: Board = new Board();
    public turn: Color = Color.White;
    public castles: Castles = { 
        "W": { "queen": false, "king": false}, 
        "B": { "queen": false, "king": false} 
    };

    public kings: Kings = {
        "W": -1, "B": -1
    }

    // " The number of halfmoves since the last capture or pawn advance, used for the fifty-move rule"
    public halves: number = 0;
    public moves: number = 0;

    public nonpassant: number | null = null;

    public attackTiles: { "W": Set<number>, "B": Set<number> } = {
        "W": new Set(), "B": new Set()
    };

    public history: Move[] = [];

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

    private _place(piece: PieceRepresentation, color: Color, position: number, firstMove?: boolean) {
        if(piece === KING) {
            this.kings[color] = position;
        }
        this.board.place(piece, color, position, firstMove);
    }

    private _remove(position: number) {
        this.board.remove(position);
    }

    public switchTurns(): void {
        this.turn = opposite(this.turn);
    }

    public moveUsingPosition(from: number, to: number) {
        let piece: Piece | null = this.board.pieces[from];
        if(piece === null) 
            throw Error("Not a valid square!");

        if(piece.color !== this.turn) 
            throw Error("Not your piece!");

        for(let move of this.getLegalMovesFor(from)) {
            if(move.start === from && move.end === to) {
                this.history.push(move);

                if(piece.representation() === KING) 
                    this.kings[piece.color] = to;

                this.nonpassant = move.flags.enpassant || null;

                if(move.flags.captured) {
                    this._remove(move.flags.captured.position);
                }
                this.board.move(move);
                this._updateAttackTiles();
                
                this.switchTurns();
                return;
            }
        }

        throw Error("Not legal move!");
    }

    public move(from: Square, to: Square): void {
        let current: number = SQUARES[from];
        let target: number = SQUARES[to];
        this.moveUsingPosition(current, target);
    }

    public isCheckmate(): boolean {
        return false;
    }

    public undo(switchTurns: boolean = true): Move | undefined {
        const move: Move | undefined = this.history.pop();
        if(move === undefined)
            return move;

        if(move.flags.promotion) {
            const piece = move.flags.promotion;
            this._place(Pieces.Pawn, piece.color, move.end, piece.firstMove);
        }

        if(move.flags.captured) {
            this._place(move.piece.representation(), move.piece.color, move.start, move.piece.firstMove);
            this._remove(move.end);
            const piece: Piece = move.flags.captured;
            this._place(piece.representation(), piece.color, piece.position, piece.firstMove);
            this._updateAttackTiles();
            if(switchTurns)
                this.switchTurns();

            if(this.history.length !== 0) {
                this.nonpassant = this.history[this.history.length - 1].flags.enpassant || null;
            }

            return move;
        }

        if(move.flags.castle) {
            this.board.undoCastle(move.piece.color, move.flags.castle);
        }

        if(move.flags.firstMove) {
            move.piece.firstMove = true;
        }

        if(move.piece.representation() === KING) {
            this.kings[move.piece.color] = move.start;
        }

        this._place(
            move.piece.representation(),
            move.piece.color,
            move.start,
            move.piece.firstMove
        );
        this._remove(move.end);
        this._updateAttackTiles();

        if(switchTurns)
            this.switchTurns();

        return move;
    }

    public getLegalMovesFor(position: number): Move[] { 
        const piece: Piece | null = this.board.pieces[position];
        if(piece === null)
            return [];

        const moves = piece.legalMoves(this).filter((move) => this._isLegalMove(move)); 
        return moves;
    }

    private _isLegalMove(move: Move): boolean {
        this.history.push(move);
        if(move.piece.representation() === KING) {
            this.kings[move.piece.color] = move.end;
        }
        this.board.move(move);
        this._updateAttackTilesFor(opposite(this.turn));
        const result = this._isKingChecked(this.turn);
        this.undo(false);
        return !result;
    }

    private _isKingChecked(color: Color): boolean {
        const king: Piece | null = this.board.pieces[this.kings[color]];
        if(king === null) {
            return true;
        }
        return this.attackTiles[opposite(color)].has(king.position); 
    }

    private _updateAttackTiles() {
        this._resetAttackTiles();
        for(const piece of this.board.pieces) {
            if(piece === null)
                continue;

            for(const move of piece.legalMoves(this)) {
                if(move.flags.jump) 
                    continue;
                if(move.flags.castle === null)
                    this.attackTiles[piece.color].add(move.end);
            }
        }
    }

    private _updateAttackTilesFor(color: Color) {
        this._resetAttackTiles(color);
        for(const piece of this.board.pieces) {
            if(piece === null)
                continue;

            if(color !== piece.color)
                continue;

            for(const move of piece.legalMoves(this)) {
                if(move.flags.jump)
                    continue;
                if(move.flags.castle === null)
                    this.attackTiles[piece.color].add(move.end);
            }
        }
    }

    private _resetAttackTiles(color?: Color) {
        if(color) {
            this.attackTiles[color].clear();
            return;
        }
        this.attackTiles[Color.White].clear();
        this.attackTiles[Color.Black].clear();
    }
}
