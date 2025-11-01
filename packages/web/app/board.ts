import { Board } from "@trent/core/model/board";
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
            pieceImage.src = `./assets/pieces/standard/${piece.color}/${piece.representation()}.png`;
            pieceImage.draggable = true;
            pieceImage.setAttribute('data-color', piece.color);

            const square = chessboard.children[i];
            square.innerHTML = '';
            square.appendChild(pieceImage);

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

