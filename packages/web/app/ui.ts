import { Color } from "@trent/core/model/constants"

class UIManager {
    public static updateTurn(color: Color) {
        const turn: HTMLElement | null = document.getElementById("turn");
        if(turn)
            turn.textContent = color;
    }
}

export default UIManager;
