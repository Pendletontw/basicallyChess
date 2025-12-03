import * as readline from 'readline/promises';
import Chess from '@trent/core';
import { Square } from '@trent/core/model/constants';

export class Game {
    private rl: any;
    private chess: Chess;
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.chess = new Chess('rnbqk1rr/ppppp2p/8/8/8/8/PPPPP2P/RNBQK2R w KQkq - 0 1');
        //this.chess = new Chess();
    }

    public async start() {
        while(!this.chess.isCheckmate()) {
            console.log(this.chess.board.toString());
            let [from, to] = await this.prompt();
    
            try {
                this.chess.move(from as Square, to as Square);
            } catch(e: unknown) {
                if(e instanceof Error) {
                    console.log(`Unable to make move: ${e.message} Try again`); 
                }
            }
        }
        this.rl.close();
    }

    private async prompt(): Promise<string[]> {
        const from = await this.rl.question(`[${this.chess.turn}] From: `);
        const to = await this.rl.question(`[${this.chess.turn}] To: `);
        return [from.trim(), to.trim()]
    }
}
