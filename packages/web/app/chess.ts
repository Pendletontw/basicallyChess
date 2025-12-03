import Chess from "@trent/core";
import BoardManager from "./board";
import { Move } from "@trent/core/model/move";
import { Color, PromotionPiece } from "@trent/core/model/constants";
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

    public makeMove(from: number, to: number, promotion?: string): boolean {
        let foundError: boolean = false;
        try {
            this.chess.moveUsingPosition(from, to, promotion as PromotionPiece);
        } catch (error) { 
            foundError = true;
        }
        finally {
            this.updateBoard();
        }
        return foundError;
    }

    public async makeEngineMove() {
        await this.chess.makeEngineMove(3);
        this.updateBoard();
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
        BoardManager.removeFloatingUI();
        if(this.chess.history.length !== 0) {
            const last = this.chess.history.length - 1;
            BoardManager.highlightMove(this.chess.history[last]);
        }
        UIManager.updateTurn(this.chess.turn);
    }

    public isPromotionSquare(position: number) {
        return this.chess.isPromotionSquare(position);
    }

    public promptPromotion(position: number) {
        BoardManager.promptPromotionChoice(position, this.chess.turn);
    }

    public getTurn(): Color {
        return this.chess.turn;
    }
}

export default ChessManager;
