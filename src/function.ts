import { GimmeTypeError } from "./error";
import { Gimme } from "./gimme";

export class GimmeFunc extends Gimme<Function> {
    constructor() {
        super();
        this.refine((data) => {
            if (typeof data !== "function") throw new GimmeTypeError("function", data);
            return data as Function;
        }, true);
    }

    primitive() {
        return this.refine((data, c, skip) => {
            if (!!(data as Function).prototype && !!(data as Function).prototype.constructor.name)
               throw new GimmeTypeError("primitive function", data);
            return data as Function;
        });
    }
}
