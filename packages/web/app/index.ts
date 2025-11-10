import ChessManager from "./chess";
import ChessboardDragController from "./dndv2";

var chessManager = new ChessManager();
var chessboardDragController = new ChessboardDragController(chessManager);

const undo = document.getElementById("undo");
undo?.addEventListener("click", () => {
    chessManager.undo();
    chessboardDragController.deactivatePiece();
});

const engine = document.getElementById("engine");
engine?.addEventListener("click", () => {
    chessManager.makeEngineMove();
});
export default chessManager;
