import { Board } from "@trent/core/model/board";
import { Color } from "@trent/core/model/constants";
import { Move } from "@trent/core/model/move";
import { Piece } from "@trent/core/model/piece";

class BoardManager {
    public static populateBoardFromChess(board: Board) {
        const chessboard = document.getElementById('board');
        if(chessboard === null)
            throw Error("Cannot populate board, board is null");

        for(let i = 0; i < board.pieces.length; i++) {
            const piece: Piece | null = board.pieces[i];
            if(piece === null) {
                const square = chessboard.children[i];
                square.innerHTML = '';
                continue;
            }

            const pieceImage = document.createElement('img');
            pieceImage.src = `./assets/pieces/chessdotcom/${piece.color}/${piece.representation()}.png`;
            pieceImage.draggable = true;
            pieceImage.setAttribute('data-color', piece.color);

            const square = chessboard.children[i];
            square.innerHTML = '';
            square.appendChild(pieceImage);

        }
    }

    public static highlightMove(move: Move): void {
        const chessboard = document.getElementById('board');
        if(chessboard === null)
            throw Error("Cannot highlight move, board is null");

        chessboard.children[move.start].classList.add('moved');
        chessboard.children[move.end].classList.add('moved');
    }

    public static unhighlightLastMoves(): void {
        const moved = document.querySelectorAll(".moved");
        for(let move of moved) {
            move.classList.remove("moved");
        }
    }

    public static removeFloatingUI(): void {
        const promotion: HTMLElement | null = document.getElementById("promotion");
        promotion?.remove();
    }

    public static addUndoCallback(callback: () => void) {
        const undo = document.getElementById("undo");
        if(undo === null) {
            throw Error("Could not find undo button");
        }

        undo.addEventListener("click", callback);
    }

    public static _createPieceButton(representation: string, color: Color) {
        const button = document.createElement('button');
        const pieceImage = document.createElement('img');
        pieceImage.src = `./assets/pieces/chessdotcom/${color}/${representation}.png`;
        pieceImage.setAttribute('data-color', color);
        button.append(pieceImage);
        return button;
    }

    public static promptPromotionChoice(position: number, color: Color): Promise<string> {
        const board: HTMLElement | null = document.getElementById("board");
        if(board === null)
            throw Error("Board not found while prompting for promotion choice.");

        if (document.getElementById('promotion') !== null) 
            return Promise.reject(new Error('A promotion window is already active.'));

        const tile  = board.children[position];
        const tileRect = tile.getBoundingClientRect();
        
        return new Promise((resolve, reject) => {
            const promotionWindow: HTMLElement = document.createElement('div');
            promotionWindow.id = "promotion";
            promotionWindow.classList.add('promotion'); 
            promotionWindow.classList.add(color); 

            promotionWindow.style.position = 'absolute';
            promotionWindow.style.zIndex = '1000';

            const blackOffset = color === "B" ? -tileRect.height * 3.5 : 0;

            promotionWindow.style.top = `${tileRect.top + window.scrollY + blackOffset}px`; 
            promotionWindow.style.left = `${tileRect.left + window.scrollX}px`;

            promotionWindow.style.width = `${tileRect.width}px`;
            promotionWindow.style.height = `${tileRect.height * 4.5}px`;

            const promotionPieces = ['q', 'r', 'b', 'n']; 

            promotionPieces.forEach(representation => {
                const button = this._createPieceButton(representation, color);

                button.addEventListener('click', (event) => {
                    event.stopPropagation(); 
                    this._cleanUpPromotion(promotionWindow, cancelHandler);
                    resolve(representation);
                });

                promotionWindow.append(button);
            });

            const cancelHandler = (event: MouseEvent) => {
                    this._cleanUpPromotion(promotionWindow, cancelHandler);
                    reject(new Error('Promotion cancelled by user.')); 
            };

            const cancelButton = document.createElement('button');
            cancelButton.addEventListener('click', cancelHandler);
            cancelButton.classList.add("cancel");
            cancelButton.innerHTML =  `
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            `;

            promotionWindow.append(cancelButton);

            //document.body.addEventListener('click', cancelHandler);
            document.body.addEventListener('contextmenu', cancelHandler);
            document.body.append(promotionWindow);
        });
    }

    private static _cleanUpPromotion(window: HTMLElement, cancelHandler: (event: MouseEvent) => void) {
        window.remove();
        document.body.removeEventListener('click', cancelHandler);
        document.body.removeEventListener('contextmenu', cancelHandler);
    }

}

export default BoardManager;

