import { Color } from "../model/constants";
import { Move } from "../model/move";
import Chess from "./chess";
import { evaluatePosition } from "./evaluation";

const CHECKMATE_SCORE = 1000000;
const STALEMATE_SCORE = 0;

function minimax(
    game: Chess,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizingPlayer: boolean
): number {
    if (!evaluatePosition) {
        throw new Error("Evaluation function not set for minimax.");
    }

    if (depth === 0) {
        return evaluatePosition(game, depth);
    }

    const legalMoves = game.getAllLegalMoves(game.turn);

    if (legalMoves.length === 0) {
        if (game.isCheckmate()) {
            return isMaximizingPlayer 
                ? -CHECKMATE_SCORE + depth 
                : CHECKMATE_SCORE - depth; 
        }
        return STALEMATE_SCORE;
    }

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (const move of legalMoves) {
            game.moveUsingMove(move);
            const evaluation = minimax(game, depth - 1, alpha, beta, false);
            game.undo();

            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, maxEval);

            if (beta <= alpha) {
                break;
            }
        }
        return maxEval;
    } else { 
        let minEval = Infinity;
        for (const move of legalMoves) {
            game.moveUsingMove(move);
            const evaluation = minimax(game, depth - 1, alpha, beta, true);
            game.undo(); 

            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, minEval);

            if (beta <= alpha) {
                break;
            }
        }
        return minEval;
    }
}

export function findBestMove(game: Chess, depth: number): Move | null {
    if (!evaluatePosition) {
        throw new Error("Evaluation function not set for findBestMove.");
    }
    
    console.log(`Starting Minimax search for ${game.turn} at depth ${depth}...`);

    const legalMoves = game.getAllLegalMoves(game.turn);
    if (legalMoves.length === 0) {
        return null;
    }

    const isMaximizingPlayer = game.turn === Color.White;

    let bestMove: Move | null = null;
    let bestEval = isMaximizingPlayer ? -Infinity : Infinity;

    for (const move of legalMoves) {
        game.moveUsingMove(move);

        const evaluation = minimax(game, depth - 1, -Infinity, Infinity, !isMaximizingPlayer);

        game.undo();

        if (isMaximizingPlayer) {
            if (evaluation > bestEval) {
                bestEval = evaluation;
                bestMove = move;
            }
        } else { 
            if (evaluation < bestEval) {
                bestEval = evaluation;
                bestMove = move;
            }
        }
    }

    console.log(`Search complete. Best evaluation: ${bestEval}. Move chosen: ${bestMove ? bestMove.toString() : 'None'}`);
    return bestMove;
}
