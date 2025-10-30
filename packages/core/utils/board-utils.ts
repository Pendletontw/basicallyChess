import Chess from '../engine/chess';
import { Board } from '../model/board';
import { BOARD_SIZE, FILES, Rank, File, KnightDirection, Direction, Color, CastleTypes, CastleSquares, CastleRookSquare, CastleKingSquare } from '../model/constants';
import { Piece } from '../model/piece';

export function isTileOnBoard(position: number): boolean {
    return position >= 0 && position < BOARD_SIZE;
}

export function isTileOccupied(board: Board, position: number): boolean {
    if(!isTileOnBoard(position)) {
        return false;
    }

    return board.pieces[position] !== null;
}

export function isTileAttacked(chess: Chess, position: number, color: Color) {
    if(color === Color.White) 
        return chess.blackAttackTiles.has(position);
    return chess.whiteAttackTiles.has(position);
}

export function areTilesOccupied(board: Board, tiles: number[]) {
    for(const tile of tiles) {
        if(isTileOccupied(board, tile))
            return true;
    }
    return false;
}

export function areTilesAttacked(chess: Chess, color: Color, tiles: number[]) {
    for(const tile of tiles) {
        if(isTileAttacked(chess, tile, color))
            return true;
    }
    return false;
}

export function isKnightExclusionTile(position: number, offset: KnightDirection): boolean {
    // Knight offsets may wrap around the board to an illegal position
    // This function isolates those examples and returns whether or not 
    // a given position is valid or not.
    const file: File = getFile(position);
    switch(offset) {
        case KnightDirection.NorthNorthEast:
            return file === File.H;
        case KnightDirection.NorthEastEast:
            return file === File.G || file === File.H;
        case KnightDirection.SouthEastEast:
            return file === File.G || file === File.H;
        case KnightDirection.SouthSouthEast:
            return file === File.H;
        case KnightDirection.NorthNorthWest:
            return file === File.A;
        case KnightDirection.NorthWestWest:
            return file === File.A || file === File.B;
        case KnightDirection.SouthWestWest:
            return file === File.A || file === File.B;
        case KnightDirection.SouthSouthWest:
            return file === File.A;
        default:
            return false;
    }
}

export function isBishopExclusionTile(position: number, offset: Direction): boolean {
    const file: File = getFile(position);
    switch(offset) {
        // The West directions will wrap the board, so exclude the tiles in the 
        // westmost file (File.A)
        case Direction.NorthWest:
            return file === File.A;
        case Direction.SouthWest:
            return file === File.A;

        // same with the South directions
        case Direction.NorthEast:
            return file === File.H;
        case Direction.SouthEast:
            return file === File.H;
        default:
            return false;
    }
}

export function isRookExclusionTile(position: number, offset: Direction): boolean {
    const file: File = getFile(position);
    switch(offset) {
        case Direction.West:
            return file === File.A;
        case Direction.East:
            return file === File.H;
        default:
            return false;
    }
}

export function isQueenExclusionTile(position: number, offset: Direction): boolean {
    const file: File = getFile(position);
    switch(offset) {
        case Direction.NorthWest:
        case Direction.West:
        case Direction.SouthWest:
            return file === File.A;

        case Direction.NorthEast:
        case Direction.East:
        case Direction.SouthEast:
            return file === File.H;

        default:
            return false;
    }
}

export function isKingExclusionTile(position: number, offset: Direction) {
    return isQueenExclusionTile(position, offset);
}

export function isPawnExclusionTile(position: number, offset: number) {
    const file: File = getFile(position);
    return ((offset === Direction.NorthWest && file === File.A) || 
            (offset === Direction.NorthEast && file === File.H) ||

            // Black pawns
            (offset === Direction.SouthWest && file === File.A) ||
            (offset === Direction.SouthEast && file === File.H));
}

export function canCastle(chess: Chess, color: Color, castle: CastleTypes) {
    const king: Piece | null = chess.board.pieces[CastleKingSquare[color]];
    if(king === null) 
        return false;

    const rook: Piece | null = chess.board.pieces[CastleRookSquare[color][castle]];
    if(rook === null)
        return false;

    if(!king.firstMove || !rook.firstMove) 
        return false;

    if(areTilesOccupied(chess.board, CastleSquares[color][castle])) {
        return false;
    }

    if(areTilesAttacked(chess, color, CastleSquares[color][castle])) {
        return false;
    }

   return true;
}

export function getRank(position: number): Rank {
    return Math.floor(position / FILES) + 1;
}

export function getFile(position: number): File {
    const LOOKUP = [File.A, File.B, File.C, File.D, File.E, File.F, File.G, File.H]
    return LOOKUP[position % FILES];
}

export function toAlgebraicNotation(position: number) {
    return getFile(position) + getRank(position).toString();
}
