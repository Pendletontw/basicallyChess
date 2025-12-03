import Chess from "./chess";
import { Color, Pieces } from "../model/constants";
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
const PIECE_PLACEMENT_MULTIPLIER = 1; 

const PIECE_VALUES: { [key: string]: number } = {
    [Pieces.Pawn]: 100,
    [Pieces.Knight]: 320,
    [Pieces.Bishop]: 330,
    [Pieces.Rook]: 500,
    [Pieces.Queen]: 900,
    [Pieces.King]: 20000, 
};

const getPSTIndex = (square: number, color: Color): number => {
    return color === Color.White ? square : 63 - square;
};

const PAWN_PST = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, -20, -20, 10, 10,  5,
    5, -5, -10,  0,  0, -10, -5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5,  5, 10, 25, 25, 10,  5,  5,
    10, 10, 20, 30, 30, 20, 10, 10,
    50, 50, 50, 50, 50, 50, 50, 50,
    0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_PST = [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20,  0,  5,  5,  0, -20, -40,
    -30,  5, 10, 15, 15, 10,  5, -30,
    -30,  0, 15, 20, 20, 15,  0, -30,
    -30,  5, 15, 20, 20, 15,  5, -30,
    -30,  0, 10, 15, 15, 10,  0, -30,
    -40, -20,  0,  0,  0,  0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50
];

const BISHOP_PST = [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10,  0,  0,  0,  0,  0,  0, -10,
    -10,  0,  5, 10, 10,  5,  0, -10,
    -10,  5,  5, 10, 10,  5,  5, -10,
    -10,  0, 10, 10, 10, 10,  0, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10,  5,  0,  0,  0,  0,  5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20
];

const ROOK_PST = [
    0,  0,  0,  5,  5,  0,  0,  0,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    5, 10, 10, 10, 10, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0
];

const QUEEN_PST = [ 
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10,  0,  0,  0,  0,  0,  0, -10,
    -10,  0,  5,  5,  5,  5,  0, -10,
    -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0, -10,
    -10,  0,  5,  0,  0,  0,  0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20
];

const KING_MIDDLE_PST = [
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20
];


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

function piecePlacement(pieces: Piece[], color: Color): number {
    let placementScore = 0;

    for (const piece of pieces) {
        const index = getPSTIndex(piece.position, color);
        
        switch (piece.representation()) {
            case Pieces.Pawn:
                placementScore += PAWN_PST[index];
                break;
            case Pieces.Knight:
                placementScore += KNIGHT_PST[index];
                break;
            case Pieces.Bishop:
                placementScore += BISHOP_PST[index];
                break;
            case Pieces.Rook:
                placementScore += ROOK_PST[index];
                break;
            case Pieces.Queen:
                placementScore += QUEEN_PST[index];
                break;
            case Pieces.King:
                placementScore += KING_MIDDLE_PST[index];
                break;
        }
    }
    return placementScore * PIECE_PLACEMENT_MULTIPLIER;
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
            const attackedPieceValue = getPieceValue(move.flags.captured as Piece); 

            if (movedPieceValue <= attackedPieceValue) {
                attackScore++;
            }
        }
    }
    return attackScore * ATTACK_MULTIPLIER;
}

function scorePlayer(game: Chess, color: Color): number {
    const playerMoves = game.getAllLegalMoves(color); 
    const opponentMoves = game.getAllLegalMoves(opposite(color)); 
    const pieces = getActivePieces(game, color);
    return (
        pieceValue(pieces) +
        piecePlacement(pieces, color) +
        mobility(playerMoves, opponentMoves) +
        check(game, color) +
        castled(game, color) +
        pawnStructure(pieces) +
        canCastle(game, color) +
        queenOutEarly(game, color) +
        attacks(playerMoves) 
    );
}

export function evaluatePosition(game: Chess, depth: number): number {
    if (game.isCheckmate()) {
        return game.turn === Color.White ? -CHECK_MATE_BONUS : CHECK_MATE_BONUS;
    }
    
    const whiteScore = scorePlayer(game, Color.White);
    const blackScore = scorePlayer(game, Color.Black);

    let whiteAdvantage = whiteScore - blackScore;

    if (Math.abs(whiteAdvantage) === CHECK_MATE_BONUS) {
        whiteAdvantage -= (Math.sign(whiteAdvantage) * depth * DEPTH_BONUS);
    }
    
    return game.turn === Color.White ? whiteAdvantage : -whiteAdvantage;
}
