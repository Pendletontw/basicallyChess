import { Move } from "@trent/core/model/move";
import chessManager from "./index";
import { Color } from "@trent/core/model/constants";
import ChessManager from "./chess";

type ChessPiece = HTMLImageElement;
type ChessSquare = HTMLDivElement;
type Chessboard = HTMLElement;

type DraggedPieceInfo = {
    piece: ChessPiece | null,
    square: ChessSquare | null,
    from: number | null,
    to: number | null,
    offsets: { x: number, y: number },
    size: { width: number, height: number },
    legals: Move[],
}

const DRAGGED_DEFAULT: DraggedPieceInfo = {
    piece: null, 
    square: null,
    from: null,
    to: null,
    offsets: { x: 0, y: 0 },
    size: { width: 0, height: 0},
    legals: [],
};

class ChessboardDragController {
 
    private dragged = structuredClone(DRAGGED_DEFAULT);     
    private currentSquare: ChessSquare | null = null;
    private chessboard: Chessboard;
    private chessManager: ChessManager = chessManager;
    private dragging = false;

    constructor(boardElementId: string) {
        const board = document.getElementById(boardElementId);
        this.chessboard = board || this._generateNewBoard();
        this._addGlobalEventListeners();
        this._addPieceDragStartListener();
    }

    private _generateNewBoard(): HTMLElement {
        const chessboard = document.createElement("div");
        chessboard.id = "board";
        chessboard.classList.add("board");
        chessboard.style.transform = "rotateX(180deg)";
        document.append(chessboard);
        return chessboard;
    }

    private _addGlobalEventListeners(): void {
        document.addEventListener('mousemove', this._handleMouseMove);
        document.addEventListener('mouseup', (event) => this._handleDrop(event));
        document.addEventListener('mousedown', (event) => {
            const IS_RIGHT_CLICK = event.button === 2;
            if(IS_RIGHT_CLICK && this.dragging) {
                this._returnPieceToOriginalSquare();
                this._resetDragState(false);
            }
        });
    }

    private _addPieceDragStartListener(): void {
        this.chessboard.addEventListener('mousedown', (event) => this._handleAttemptedSelect(event));
        this.chessboard.addEventListener('contextmenu', (e) => { e.preventDefault(); });
    }

    private _handleMouseMove = (event: MouseEvent): void => {
        this.moveAt(event.pageX, event.pageY);
        if(this.dragging) {
            this.highlightDropSquare(event.clientX, event.clientY);
        }
    }

    private _handleAttemptedSelect(event: MouseEvent) {
        const IS_RIGHT_CLICK = event.button === 2;
        if(IS_RIGHT_CLICK && this.dragging) {
            this._returnPieceToOriginalSquare();
            this._resetDragState(false);
            return;
        }

        const target: HTMLElement = event.target as HTMLElement;
        const position: number = this._findPositionOfElement(target);

        if(this.dragged.piece) {
            const error = this._attemptToMakeMove(position);
            this._resetDragState();
            if(error) {
                const newTarget = this._getTile(position);
                this._setActive(newTarget, event);
            }
        }
        else {
            this._setActive(target, event);
        }
    }

    private _handleDrop(event: MouseEvent) {
        if(this.dragged.piece === null) 
            return;

        this.dragging = false;
        const target: HTMLElement = event.target as HTMLElement;
        const position: number = this._findPositionOfElement(target);
        const error = this._attemptToMakeMove(position);
        if(error) {
            this.dragged.piece.remove();
            this._resetDragPieceStyles();
        } else {
            this._resetDragState();
        }
    }

    private _setActive(element: HTMLElement, event: MouseEvent): void {
        let piece: ChessPiece;
        if(this._isPiece(element)) {
            piece = element as ChessPiece;
        } else if (this._isSquare(element) && element.children.length === 1) {
            piece = element.children[0] as ChessPiece;
        } else {
            return;
        }

        this._resetDragState();
        piece.ondragstart = () => false;

        this.dragging = true;
        this.dragged.piece = piece;
        this.dragged.square = piece.parentElement as ChessSquare;
        this.dragged.from = this._getPositionOfTile(this.dragged.square);
        this.dragged.square.classList.add("active");

        const rect = this.dragged.piece.getBoundingClientRect();
        this.dragged.size.width = rect.width;
        this.dragged.size.height = rect.height;

        this.dragged.offsets.x = rect.width / 2;
        this.dragged.offsets.y = rect.height / 2;
        this.dragged.legals = this.chessManager.getLegalMovesForPiece(this.dragged.from);
        this.setDragStyles();
        this.highlightLegalTiles();

        document.body.appendChild(piece);

        this.moveAt(event.pageX, event.pageY);
    }

    private highlightLegalTiles() {
        if(this.dragged.legals.length === 0) 
            return;

        if(this.dragged.piece) {
            const color = this.dragged.piece.getAttribute("data-color") as Color;
            if(color !== this.chessManager.getTurn()) {
                return;
            }
        }

        for(const move of this.dragged.legals) {
            this.chessboard.children[move.end].classList.add("target");
        }
    }

    private setDragStyles() {
        if(this.dragged.piece === null)
            return;

        this.dragged.piece.style.width = `${this.dragged.size.width}px`;
        this.dragged.piece.style.height = `${this.dragged.size.width}px`;
        this.dragged.piece.style.position = 'absolute';
        this.dragged.piece.style.zIndex = '1000';
        this.dragged.piece.style.cursor = 'grabbing';
        this.dragged.piece.style.pointerEvents = 'none';

        this.chessboard.style.cursor = 'grabbing';
    }

    private _attemptToMakeMove(position: number): boolean {
        if(this.dragged.from === null)
            return false;

        return this.chessManager.makeMove(this.dragged.from, position);
    }

    private moveAt(pageX: number, pageY: number): void {
        if (!this.dragged.piece) 
            return;

        this.dragged.piece.style.left = pageX - this.dragged.offsets.x + 'px';
        this.dragged.piece.style.top = pageY - this.dragged.offsets.y + 'px';
    }

    private highlightDropSquare(clientX: number, clientY: number): void {
        const elementUnderCursor = document.elementFromPoint(clientX, clientY);

        const newSquare = elementUnderCursor && elementUnderCursor.classList.contains('square')
            ? (elementUnderCursor as ChessSquare) : null;

        if (newSquare && newSquare !== this.currentSquare) {
            this.currentSquare?.classList.remove('drag-over');
            this.currentSquare = newSquare;
            this.currentSquare.classList.add('drag-over');
        } else if (!newSquare && this.currentSquare) {
            this.currentSquare.classList.remove('drag-over');
            this.currentSquare = null;
        }
    }

    private _resetDragPieceStyles() {
        if (this.dragged.piece) {
            this.dragged.piece.style.cssText = '';
            this.currentSquare?.classList.remove("drag-over");
        }
    }

    private _resetDragState(removePiece: boolean = true): void {
        if (this.dragged.piece) {
            this._resetDragPieceStyles();
            this._unhighlightTargetSquares(this.dragged.legals);
            this.dragged.square?.classList.remove("active");
            if(removePiece)
                this.dragged.piece.remove();
            this.dragged = structuredClone(DRAGGED_DEFAULT);
            this.dragging = false;
        }

        this.chessboard.style.cursor = 'default';
    }

    private _unhighlightTargetSquares(moves: Move[]) {
        for(const move of moves) {
            this.chessboard.children[move.end].classList.remove("target");
        }
    }

    private _findPositionOfElement(element: HTMLElement): number {
        const IS_SQUARE: boolean = element.classList.contains("square");
        if(IS_SQUARE) {
            return this._getPositionOfTile(element as ChessSquare);
        }

        const IS_PIECE = element.tagName === "IMG" && element.parentElement?.classList.contains("square");
        if(IS_PIECE) {
            return this._getPositionOfTile(element.parentElement as ChessSquare);
        }
        
        return -1;
    }

    private _getPositionOfTile(tile: ChessSquare): number {
        return [...this.chessboard.children].indexOf(tile);
    }

    private _getTile(position: number): ChessSquare {
        if(position === -1)
            throw Error("Position is out of bounds for the chessboard.");
        return this.chessboard.children[position] as ChessSquare;
    }

    private _isPiece(element: HTMLElement): boolean {
        const IS_IMAGE: boolean = element.tagName === "IMG";
        const IS_IN_SQUARE: boolean = element.parentElement?.classList.contains("square") || false;
        return IS_IMAGE && IS_IN_SQUARE;
    }

    private _isSquare(element: HTMLElement) {
        return element.classList.contains("square");
    }

    private _returnPieceToOriginalSquare() {
        if(this.dragged.piece && this.dragged.square) {
            this.dragged.square.append(this.dragged.piece);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChessboardDragController('board');
});
