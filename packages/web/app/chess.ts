import Chess from "@trent/core";
import BoardManager from "./board";
import { Move } from "@trent/core/model/move";
import { Color } from "@trent/core/model/constants";
import UIManager from "./ui";

class ChessManager {
    private chess = new Chess();

    constructor() {
        BoardManager.populateBoardFromChess(this.chess.board);
        UIManager.updateTurn(this.chess.turn);
    }

    public getLegalMovesForPiece(position: number): Move[] {
        return this.chess.getLegalMovesFor(position);
    }

    public makeMove(from: number, to: number): boolean {
        let foundError: boolean = false;
        try {
            this.chess.moveUsingPosition(from, to);
        } catch (error) { 
            foundError = true;
        }
        finally {
            this.updateBoard();
        }
        return foundError;
    }

    public undo(): void {
        try {
            this.chess.undo();
        } catch (error) { }
        finally {
            this.updateBoard();
        }
    }

    public updateBoard() {
        BoardManager.populateBoardFromChess(this.chess.board);
        BoardManager.unhighlightLastMoves();
        if(this.chess.history.length !== 0) {
            const last = this.chess.history.length - 1;
            BoardManager.highlightMove(this.chess.history[last]);
        }
        UIManager.updateTurn(this.chess.turn);
    }

    public getTurn(): Color {
        return this.chess.turn;
    }
}

export default ChessManager;
