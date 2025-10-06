import { Piece } from "./piece";

export class Move {
    public start: number;
    public end: number;
    public piece: Piece;
    public captured: Piece | null;
    public promotion: Piece | null;

    constructor(start: number, end: number, piece: Piece, captured?: Piece | null, promotion?: Piece | null) {
        this.start = start;
        this.end = end;
        this.piece = piece;
        this.captured = captured || null;
        this.promotion = promotion || null;
    }
}
