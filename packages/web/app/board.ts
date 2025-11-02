import { Board } from "@trent/core/model/board";
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

    public static addUndoCallback(callback: () => void) {
        const undo = document.getElementById("undo");
        console.log("called?");
        if(undo === null) {
            console.log("could not find");
            throw Error("Could not find undo button");
        }

        undo.addEventListener("click", callback);
    }
}

export default BoardManager;

