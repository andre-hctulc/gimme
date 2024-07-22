import { GimmeTypeError } from "./error";
import { Gimme, Spawner } from "./gimme";

export class GimmeSymbol extends Gimme<symbol> {
    protected spawn(refine: Spawner<symbol>): void {
        refine((data) => {
            if (typeof data !== "symbol") throw new GimmeTypeError("symbol", data);
            return data as symbol;
        });
    }
}
