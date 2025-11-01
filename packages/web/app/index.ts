import ChessManager from "./chess";

var chessManager = new ChessManager();

const undo = document.getElementById("undo");
undo?.addEventListener("click", () => {
    chessManager.undo();
});

export default chessManager;
