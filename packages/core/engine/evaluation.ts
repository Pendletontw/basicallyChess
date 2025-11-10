import Chess from "./chess";
import { Color, Pieces, SQUARES } from "../model/constants";
import { Piece } from "../model/piece";
import { opposite } from "../utils/board-utils";
import { Move } from "../model/move";

export const MAX_SEARCH_DEPTH = 5;

const CHECK_BONUS = 45;
const CHECK_MATE_BONUS = 10000;
const DEPTH_BONUS = 100;
const MOBILITY_MULTIPLIER = 5;
const CASTLE_BONUS = 25;
const ATTACK_MULTIPLIER = 1;
const TWO_BISHOPS_BONUS = 25;
const CAN_CASTLE_BONUS = 50;
const EARLY_QUEEN_MOVE_PENALTY = -10;
const KING_SAFETY_BONUS = 35;

const PIECE_VALUES: { [key: string]: number } = {
    [Pieces.Pawn]: 100,
    [Pieces.Knight]: 320,
    [Pieces.Bishop]: 330,
    [Pieces.Rook]: 500,
    [Pieces.Queen]: 900,
    [Pieces.King]: 20000, 
};

function getPieceValue(piece: Piece): number {
    return PIECE_VALUES[piece.representation()] || 0;
}

function getActivePieces(game: Chess, color: Color): Piece[] {
    return game.board.pieces.filter(
        (piece): piece is Piece => piece !== null && piece.color === color
    );
}

function isKingInCheck(game: Chess, color: Color): boolean {
    const kingPosition = game.kings[color];
    if (kingPosition === -1) return false;

    return game.attackTiles[opposite(color)].has(kingPosition);
}

function pieceValue(pieces: Piece[]): number {
    let pieceValuationScore = 0;
    let numBishops = 0;

    for (const piece of pieces) {
        pieceValuationScore += getPieceValue(piece);
        if (piece.representation() === Pieces.Bishop) {
            numBishops++;
        }
    }
    return pieceValuationScore + (numBishops >= 2 ? TWO_BISHOPS_BONUS : 0);
}

function mobility(playerMoves: Move[], opponentMoves: Move[]): number {
    const mobilityRatio = opponentMoves.length === 0 ? playerMoves.length : (playerMoves.length * 10.0) / opponentMoves.length;

    return MOBILITY_MULTIPLIER * mobilityRatio;
}

function check(game: Chess, color: Color): number {
    const opponentColor = opposite(color);
    return isKingInCheck(game, opponentColor) ? CHECK_BONUS : 0;
}

function castled(game: Chess, color: Color): number {
    return game.castled[color] ? CASTLE_BONUS : 0;
}

function pawnStructure(pieces: Piece[]): number {
    let doubledPawnPenalty = 0;
    const pawnCounts: { [file: number]: number } = {};

    for(const piece of pieces) {
        if(piece.representation() === Pieces.Pawn) {
            const file = piece.position % 8;
            pawnCounts[file] = (pawnCounts[file] || 0) + 1;
        }
    }

    for (const file in pawnCounts) {
        if (pawnCounts[file] > 1) {
            doubledPawnPenalty += (pawnCounts[file] - 1) * 20;
        }
    }
    return -doubledPawnPenalty;
}

function canCastle(game: Chess, color: Color): number {
    const { king, queen } = game.castles[color];
    
    if ((king || queen) && !game.castled[color]) {
        return CAN_CASTLE_BONUS;
    }
    return 0;
}

function queenOutEarly(game: Chess, color: Color): number {
    let isQueenMoved = false;
    let minorPiecesDeveloped = 0;
    const activePieces = getActivePieces(game, color);

    for (const piece of activePieces) {
        if (piece.representation() === Pieces.Queen && !piece.firstMove) {
            isQueenMoved = true;
        }
        
        if (
            (piece.representation() === Pieces.Knight || piece.representation() === Pieces.Bishop) &&
            !piece.firstMove
        ) {
            minorPiecesDeveloped++;
        }
    }

    if (isQueenMoved && minorPiecesDeveloped < 2) {
        return EARLY_QUEEN_MOVE_PENALTY;
    }
    
    return 0;
}

function attacks(moves: Move[]): number {
    let attackScore = 0;

    for (const move of moves) {
        if (move.flags.captured) {
            const movedPieceValue = getPieceValue(move.piece);
            const attackedPieceValue = getPieceValue(move.flags.captured);

            if (movedPieceValue <= attackedPieceValue) {
                attackScore++;
            }
        }
    }
    return attackScore * ATTACK_MULTIPLIER;
}

function kingSafety(game: Chess, color: Color): number {
    if (!game.castled[color]) {
        return 0; 
    }

    const kingPos = game.kings[color];
    let safetyScore = 0;

    if (color === Color.White) {
        if (kingPos === SQUARES.g1) { 
            const files = [SQUARES.f2, SQUARES.g2, SQUARES.h2];
            const hasPawnShield = files.every(i => game.board.pieces[i]?.representation() === Pieces.Pawn && game.board.pieces[i]?.color === color);
            if (hasPawnShield) safetyScore += KING_SAFETY_BONUS;
        } else if (kingPos === SQUARES.c1) {
            const files = [SQUARES.a2, SQUARES.b2, SQUARES.c2];
            const hasPawnShield = files.every(i => game.board.pieces[i]?.representation() === Pieces.Pawn && game.board.pieces[i]?.color === color);
            if (hasPawnShield) safetyScore += KING_SAFETY_BONUS;
        }
    } else {
        if (kingPos === SQUARES.g8) {
            const files = [SQUARES.f7, SQUARES.g7, SQUARES.h7];
            const hasPawnShield = files.every(i => game.board.pieces[i]?.representation() === Pieces.Pawn && game.board.pieces[i]?.color === color);
            if (hasPawnShield) safetyScore += KING_SAFETY_BONUS;
        } else if (kingPos === SQUARES.c8) {
            const files = [SQUARES.a7, SQUARES.b7, SQUARES.c7];
            const hasPawnShield = files.every(i => game.board.pieces[i]?.representation() === Pieces.Pawn && game.board.pieces[i]?.color === color);
            if (hasPawnShield) safetyScore += KING_SAFETY_BONUS;
        }
    }
    
    return safetyScore;
}


function scorePlayer(game: Chess, color: Color): number {
    const playerMoves = game.getAllLegalMoves(game.turn); 
    const opponentMoves = game.getAllLegalMoves(opposite(game.turn)); 
    const pieces = getActivePieces(game, color);
    return (
        pieceValue(pieces) +
        mobility(playerMoves, opponentMoves) +
        check(game, color) +
        castled(game, color) +
        pawnStructure(pieces) +
        canCastle(game, color) +
        queenOutEarly(game, color) +
        attacks(playerMoves) +
        kingSafety(game, color)
    );
}

export function evaluatePosition(game: Chess, depth: number): number {
    const whiteScore = scorePlayer(game, Color.White);
    const blackScore = scorePlayer(game, Color.Black);

    const whiteAdvantage = whiteScore - blackScore;

    if (game.turn === Color.Black) {
        return -whiteAdvantage;
    }
    
    return whiteAdvantage;
}
