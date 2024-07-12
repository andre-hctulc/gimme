import { GimmeTypeError } from "./error";
import { Gimme, Refiner } from "./gimme";

export class GimmeSymbol extends Gimme<symbol> {
    protected spawn(refine: (refiner: Refiner<symbol>) => void): void {
        refine((data) => {
            if (typeof data !== "symbol") throw new GimmeTypeError("symbol", data);
            return data as symbol;
        });
    }
}
