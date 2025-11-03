import ChessManager from "./chess";
import ChessboardDragController from "./dndv2";

var chessManager = new ChessManager();
var chessboardDragController = new ChessboardDragController(chessManager);

const undo = document.getElementById("undo");
undo?.addEventListener("click", () => {
    chessManager.undo();
    chessboardDragController.deactivatePiece();

});

export default chessManager;
