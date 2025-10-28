import { Chess } from "@trent/core";

export function populateBoard(chess: Chess) {
	const board = document.getElementById('board');
    if(board === null)
        throw Error("Cannot populate board, board is null");

    for(const piece of chess.board.pieces) {
        if(piece === null) 
            continue;

        const pieceImage = document.createElement('img');
        pieceImage.src = `./assets/pieces/standard/${piece.color}/${piece.representation()}.png`;
        pieceImage.draggable = true;

        const square = board.children[piece.position];
        square.innerHTML = '';
        square.appendChild(pieceImage);
    }
}
