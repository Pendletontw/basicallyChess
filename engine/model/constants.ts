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
