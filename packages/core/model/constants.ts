import { Piece } from "./piece";

export enum Pieces {
    None = "_",
    Pawn = "p",
    Knight = "n",
    Bishop = "b",
    Rook = "r",
    Queen = "q",
    King = "k",
}

export enum Color {
    White = "W",
    Black = "B"
}

export enum Direction {
    North = 8,
    NorthEast = 9,
    East = 1,
    SouthEast = -7,
    South = -8,
    SouthWest = -9,
    West = -1,
    NorthWest = 7,
}

// Directions of attack squares that a Knight may go
// Indicated by the pattern:
// https://www.chessprogramming.org/Knight_Pattern (Knight Attacks)
export enum KnightDirection {
    // Top left pair of attacks
    NorthNorthWest = 15,
    NorthWestWest  = 6,

    // Top right pair of attacks
    NorthNorthEast = 17,
    NorthEastEast  = 10,

    // Bottom left pair of attacks
    SouthWestWest  = -10,
    SouthSouthWest = -17,

    // Bottom right pair of attacks
    SouthEastEast  = -6,
    SouthSouthEast = -15,
}

export enum File {
    A = 'a',
    B = 'b',
    C = 'c',
    D = 'd',
    E = 'e',
    F = 'f',
    G = 'g',
    H = 'h',
}

export enum Rank {
    One = 1, 
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
}

export const BOARD_SIZE = 64;
export const RANKS = 8;
export const FILES = 8;
export const NEXT_RANK = 8;
export const DECIMAL = 10;

export const PAWN = 'p';
export const KNIGHT = 'n';
export const BISHOP = 'b';
export const ROOK = 'r';
export const QUEEN = 'q';
export const KING = 'k';

export type PieceRepresentation = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export type Square =
    'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8' |
    'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' |
    'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' |
    'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' |
    'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' |
    'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' |
    'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' |
    'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1';

export const DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const SQUARES = {
    a8: 56, b8: 57, c8: 58, d8: 59, e8: 60, f8: 61, g8: 62, h8: 63,
    a7: 48, b7: 49, c7: 50, d7: 51, e7: 52, f7: 53, g7: 54, h7: 55,
    a6: 40, b6: 41, c6: 42, d6: 43, e6: 44, f6: 45, g6: 46, h6: 47,
    a5: 32, b5: 33, c5: 34, d5: 35, e5: 36, f5: 37, g5: 38, h5: 39,
    a4: 24, b4: 25, c4: 26, d4: 27, e4: 28, f4: 29, g4: 30, h4: 31,
    a3: 16, b3: 17, c3: 18, d3: 19, e3: 20, f3: 21, g3: 22, h3: 23,
    a2: 8,  b2: 9,  c2: 10, d2: 11, e2: 12, f2: 13, g2: 14, h2: 15,
    a1: 0,  b1: 1,  c1: 2,  d1: 3,  e1: 4,  f1: 5,  g1: 6,  h1: 7,
}

export type Castles = {
    "W": {"queen": boolean, "king": boolean}, 
    "B": {"queen": boolean, "king": boolean } 
};

export enum CastleTypes {
    QueenSide = "qs",
    KingSide = "ks"
}

export type Kings = {
    "W": number,
    "B": number,
};

export const CastleSquares = {
    "W": {
        "qs": [SQUARES.b1, SQUARES.c1, SQUARES.d1],
        "ks": [SQUARES.f1, SQUARES.g1]
    },
    "B": {
        "qs": [SQUARES.b8, SQUARES.c8, SQUARES.d8],
        "ks": [SQUARES.f8, SQUARES.g8]
    }
}

export const CastleKingSquare = {
    "W": SQUARES.e1,
    "B": SQUARES.e8
}

export const CastleRookSquare = {
    "W": {
        "qs": SQUARES.a1,
        "ks": SQUARES.h1
    },
    "B": {
        "qs": SQUARES.a8,
        "ks": SQUARES.h8
    }
}

export enum PawnJump {
    Short,
    Long,
}

export type Flags = {
    captured?: Piece | null,
    promotion?: Piece | null,
    castle?: CastleTypes | null,
    enpassant?: number | null,
    firstMove?: boolean | null,
    jump?: PawnJump | null,
}
