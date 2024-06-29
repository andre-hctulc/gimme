import { GimmeTypeError } from "./error";
import { Gimme, Refine } from "./gimme";

export class GimmeSymbol extends Gimme<symbol> {
    protected spawn(refine: (refiner: Refine<symbol>) => void): void {
        refine((data) => {
            if (typeof data !== "symbol") throw new GimmeTypeError("symbol", data);
            return data as symbol;
        });
    }
}
