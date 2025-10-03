import { BOARD_SIZE, FILES } from '../model/constants';

export function isSquareOnBoard(position: number): boolean {
    return position >= 0 && position < BOARD_SIZE;
}

export function getRank(position: number): number {
    return Math.floor(position / FILES);
}

export function getFile(position: number): number {
    return position % FILES;
}
