import { Move } from "@trent/core/model/move";
import ChessManager from "./chess";
import { Color } from "@trent/core/model/constants";

type ChessPiece = HTMLImageElement;
type ChessSquare = HTMLDivElement;
type Chessboard = HTMLElement;

class ChessboardDragController {
    private chessboard: Chessboard;
    private draggedPiece: ChessPiece | null = null;
    private originalSquare: ChessSquare | null = null;
    private currentSquare: ChessSquare | null = null;
    private originalPosition: number | null = null;
    private targetPosition: number | null = null;
    private offsetX: number = 0;
    private offsetY: number = 0;
    private originalWidth: number = 0;
    private originalHeight: number = 0;
    private chessManager: ChessManager = new ChessManager();
    private legalMoves: Move[] = [];

    constructor(boardElementId: string) {
        const board = document.getElementById(boardElementId);
        if (board) {
            this.chessboard = board;
        }
        else {
            this.chessboard = document.createElement("div");
            this.chessboard.id = "board";
            this.chessboard.classList.add("board");
            this.chessboard.style.transform = "rotateX(180deg)";
            document.append(this.chessboard);
        }
        this.addGlobalEventListeners();
        this.addPieceDragStartListener();
    }

    private addGlobalEventListeners(): void {
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    private addPieceDragStartListener(): void {
        this.chessboard.addEventListener('mousedown', (event: MouseEvent) => {
            const target = event.target as ChessPiece;

            if (target && target.tagName === 'IMG') {
                this.startDrag(event, target);
            }
        });
    }

    private startDrag(event: MouseEvent, piece: ChessPiece): void {
        piece.ondragstart = () => false;

        this.draggedPiece = piece;
        this.originalSquare = this.draggedPiece.parentElement as ChessSquare;
        this.originalPosition = this.getPositionOfTile(this.originalSquare);
        this.setDragStyles();
        this.getLegalTiles(this.originalPosition);
        this.highlightLegalTiles();

        document.body.appendChild(this.draggedPiece);

        this.disablePointerEventsForAllOtherPieces();
        this.moveAt(event.pageX, event.pageY);
    }

    private getLegalTiles(position: number) {
        this.legalMoves = this.chessManager.getLegalMovesForPiece(position);
    }

    private highlightLegalTiles() {
        if(this.legalMoves.length === 0) 
            return;

        if(this.draggedPiece) {
            const color = this.draggedPiece.getAttribute("data-color") as Color;
            if(color !== this.chessManager.getTurn()) {
                return;
            }
        }

        for(const move of this.legalMoves) {
            this.chessboard.children[move.end].classList.add("target");
        }
    }

    private setDragStyles() {
        if(this.draggedPiece === null)
            return;


        const rect = this.draggedPiece.getBoundingClientRect();
        this.originalWidth = rect.width;
        this.originalHeight = rect.height;

        this.offsetX = this.originalWidth / 2;
        this.offsetY = this.originalHeight / 2;

        this.draggedPiece.style.width = `${this.originalWidth}px`;
        this.draggedPiece.style.height = `${this.originalHeight}px`;
        this.draggedPiece.style.position = 'absolute';
        this.draggedPiece.style.zIndex = '1000';
        this.draggedPiece.style.cursor = 'grabbing';
        this.draggedPiece.style.pointerEvents = 'none';

        this.chessboard.style.cursor = 'grabbing';
    }

    private handleMouseMove = (event: MouseEvent): void => {
        if (!this.draggedPiece) {
            return;
        }

        this.moveAt(event.pageX, event.pageY);
        this.highlightDropSquare(event.clientX, event.clientY);
    }

    private handleMouseUp = (event: MouseEvent): void => {
        if (!this.draggedPiece) {
            return;
        }

        const elementUnderCursor = document.elementFromPoint(
            event.clientX,
            event.clientY
        );

        if (this.currentSquare) {
            this.currentSquare.classList.remove('drag-over');
        }

        const dropSuccess = this.handleDrop(elementUnderCursor);
        this.resetDragState();
    }

    private handleDrop(elementUnderCursor: Element | null): boolean {
        if (this.isValidDropLocation(elementUnderCursor) && this.draggedPiece && this.originalPosition) {
            this.targetPosition = this.getPositionOfTile(elementUnderCursor);
            if(this.targetPosition) {
                this.chessManager.makeMove(this.originalPosition, this.targetPosition)
            }

        } else if (this.draggedPiece && this.originalSquare) {
            //this.originalSquare.appendChild(this.draggedPiece);
        }
        if(this.draggedPiece) {
            this.draggedPiece.remove();
        }

        return false;
    }

    private moveAt(pageX: number, pageY: number): void {
        if (!this.draggedPiece) return;

        this.draggedPiece.style.left = pageX - this.offsetX + 'px';
        this.draggedPiece.style.top = pageY - this.offsetY + 'px';
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

    private isValidDropLocation(elementUnderCursor: Element | null): elementUnderCursor is ChessSquare {
        if (!elementUnderCursor) 
            return false;

        if (!elementUnderCursor.classList.contains('square')) 
            return false;
        return true;


        //const square = elementUnderCursor as ChessSquare;
        //const position = this.getPositionOfTile(square);
        //for(const move of this.legalMoves) {
        //    if(position === move.end) 
        //        return true;
        //}
        //return false;
    }

    private resetDragState(): void {
        if (this.draggedPiece) {
            this.draggedPiece.style.cssText = '';
            
            this.draggedPiece = null;
            this.originalSquare = null;
            this.originalPosition = null;
            this.targetPosition = null;
            this.currentSquare = null;
            this.offsetX = 0;
            this.offsetY = 0;
            this.originalWidth = 0;
            this.originalHeight = 0;
        }

        if(this.legalMoves.length !== 0) {
            for(const move of this.legalMoves) {
                this.chessboard.children[move.end].classList.remove("target");
            }
        }

        this.chessboard.style.cursor = 'default';
        this.reenablePointerEventsForAllPieces();
    }

    private disablePointerEventsForAllOtherPieces(): void {
        const pieces = document.querySelectorAll<ChessPiece>('.board img');
        pieces.forEach((piece) => {
            if (piece !== this.draggedPiece) {
                piece.style.pointerEvents = 'none';
            }
        });
    }

    private reenablePointerEventsForAllPieces(): void {
        const pieces = document.querySelectorAll<ChessPiece>('.board img');
        pieces.forEach((piece) => {
            piece.style.pointerEvents = '';
        });
    }

    private getPositionOfTile(tile: ChessSquare): number {
        return [...this.chessboard.children].indexOf(tile);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChessboardDragController('board');
});
