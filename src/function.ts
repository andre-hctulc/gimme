import { GimmeTypeError } from "./error";
import { Gimme, Refiner } from "./gimme";

export class GimmeFunc extends Gimme<Function> {
    protected spawn(refine: (refiner: Refiner<Function>) => void): void {
        refine((data) => {
            if (typeof data !== "function") throw new GimmeTypeError("function", data);
            return data as Function;
        });
    }

    primitive() {
        return this.refine((data, c, skip) => {
            const str = (data as any).toString();
            if (!str.startsWith("function")) throw new GimmeTypeError("primitive function", "class");
            return data as Function;
        });
    }
    
    ctr() {
        return this.refine((data, c, skip) => {
            const str = (data as any).toString();
            if (!str.startsWith("class")) throw new GimmeTypeError("primitive function", "class");
            return data as Function;
        });
    }
}
