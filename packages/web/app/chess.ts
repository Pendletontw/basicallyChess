import Chess from "@trent/core";
import BoardManager from "./board";
import { Move } from "@trent/core/model/move";
import { Color } from "@trent/core/model/constants";

class ChessManager {
    private chess = new Chess();

    constructor() {
        BoardManager.populateBoardFromChess(this.chess.board);
    }

    public getLegalMovesForPiece(position: number): Move[] {
        const piece = this.chess.board.pieces[position];
        if(piece === null) {
            return [];
        }
        return piece.legalMoves(this.chess.board);
    }

    public makeMove(from: number, to: number): boolean {
        try {
            this.chess.moveUsingPosition(from, to);
        } catch (error) { }
        finally {
            console.log("still repopulating");
            BoardManager.populateBoardFromChess(this.chess.board);
        }
        return true;

    }

    public getTurn(): Color {
        return this.chess.turn;
    }
}

export default ChessManager;
