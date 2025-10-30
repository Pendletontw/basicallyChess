import { Flags } from "./constants";
import { Piece } from "./piece";

export class Move {
    public start: number;
    public end: number;
    public piece: Piece;
    public flags: Flags = { captured: null, promotion: null, castle: null, enpassant: null };

    constructor(start: number, end: number, piece: Piece, flags?: Flags) {
        this.start = start;
        this.end = end;
        this.piece = piece;
        this.flags = {...this.flags, ...flags}
    }
}
