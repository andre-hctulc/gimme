import { GimmeTypeError } from "./error";
import { Gimme } from "./gimme";

export class GimmeSymbol extends Gimme<symbol> {
    constructor() {
        super();
        this.refine(
            (data) => {
                if (typeof data !== "symbol") throw new GimmeTypeError("symbol", data);
                return data as symbol;
            },
            true,
            false
        );
    }
}
