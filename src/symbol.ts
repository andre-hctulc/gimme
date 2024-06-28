import { GimmeTypeError } from "./error";
import { Gimme } from "./gimme";

export class GimmeSymbol extends Gimme<symbol> {
    constructor() {
        super();
        this.spawn((data) => {
            if (typeof data !== "symbol") throw new GimmeTypeError("symbol", data);
            return data as symbol;
        });
    }
}
