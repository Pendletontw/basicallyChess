import { Move } from "@trent/core/model/move";
import chessManager from "./index";
import { Color } from "@trent/core/model/constants";
import ChessManager from "./chess";

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
    private chessManager: ChessManager = chessManager;
    private legalMoves: Move[] = [];
    private twoClickActive = false;
    private dragging = false;
    private notLegal = false;

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
            const target: HTMLElement = event.target as HTMLElement;
            const isSquare = target.classList.contains("square");
            const isPiece = target.parentElement?.classList.contains("square");
            if(isSquare) {
                console.log("is a square");
            } 
            else if(isPiece) {
                if(target.parentElement && this.originalPosition) {
                    const position = this.getPositionOfTile(target.parentElement as ChessSquare);
                    const error = this.chessManager.makeMove(this.originalPosition, position);
                    if(!error) {
                        this.resetDragState();
                        return;
                    }
                    
                }
                console.log("is an image");
                this.startDrag(event, target as ChessPiece);
                return;
            } 
            else {
                console.warn("is neither?");
            }

            if(target && target.tagName === 'IMG') {
                this.startDrag(event, target as ChessPiece);
            }
        });
    }

    private startDrag(event: MouseEvent, piece: ChessPiece): void {
        console.log("STARTING DRAG");
        this.resetDragState();
        piece.ondragstart = () => false;

        this.dragging = true;
        this.draggedPiece = piece;
        this.originalSquare = this.draggedPiece.parentElement as ChessSquare;
        this.originalSquare.classList.add("active");
        this.originalPosition = this.getPositionOfTile(this.originalSquare);
        this.setDragStyles();
        this.getLegalTiles(this.originalPosition);
        this.highlightLegalTiles();

        document.body.appendChild(this.draggedPiece);

        //this.disablePointerEventsForAllOtherPieces();
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
        if(this.dragging) {
            this.highlightDropSquare(event.clientX, event.clientY);
        }
    }

    private handleMouseUp = (event: MouseEvent): void => {
        console.log("HANDLING MOUSE UP");
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

        this.handleDrop(elementUnderCursor);
        if(!this.twoClickActive) {
            console.log("drag state reset");
            this.resetDragState();
        } else {
            console.log("resetting drag piece styles");
            this.resetDragPieceStyles(); 
        }
    }

    private handleDrop(elementUnderCursor: Element | null) {
        console.log(elementUnderCursor);
        if(elementUnderCursor?.parentElement?.classList.contains("square")) {
            elementUnderCursor = elementUnderCursor.parentElement;
        }
        console.log("HANDLING DROP");
        if(this.draggedPiece && elementUnderCursor && this.originalSquare === elementUnderCursor) {
            console.log("in the first");
            elementUnderCursor.append(this.draggedPiece);
            this.twoClickActive = !this.twoClickActive;
            this.dragging = !this.twoClickActive;
            return;
        }

        if(!this.isValidDropLocation(elementUnderCursor) && this.draggedPiece && this.originalSquare) {
            console.log("in the second");
            if(this.dragging) {
                console.log("in the second nested", this.isValidDropLocation(elementUnderCursor), this.draggedPiece, this.originalSquare);
                this.originalSquare.append(this.draggedPiece);
                this.twoClickActive = true;
                this.dragging = false;
                return;
            }
            this.twoClickActive = false;
            return;
        }

        this.twoClickActive = false;
        if (this.isValidDropLocation(elementUnderCursor) && this.draggedPiece && this.originalPosition !== null) {
            this.targetPosition = this.getPositionOfTile(elementUnderCursor);
            if(this.targetPosition) {
                const result = this.chessManager.makeMove(this.originalPosition, this.targetPosition)
                console.log("made move with result: ", result);
                this.notLegal = result;
                if(this.dragging)
                    this.twoClickActive = result;
            }
        }

        if(this.draggedPiece) {
            this.draggedPiece.remove();
            this.dragging = false;
        }
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
        if (!elementUnderCursor) {
            console.log("not an element under cursor");
            return false;
        }

        if (!elementUnderCursor.classList.contains('square')) {

            console.log("isn't a square");
            return false;
        }

        return true;
    }

    private resetDragPieceStyles() {
        if (this.draggedPiece) {
            this.draggedPiece.style.cssText = '';
        }
    }

    private resetDragState(): void {
        if (this.draggedPiece) {
            this.draggedPiece.style.cssText = '';
            
            this.dragging = false;
            this.draggedPiece = null;
            this.originalSquare?.classList.remove("active");
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
