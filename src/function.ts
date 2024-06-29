import { GimmeTypeError } from "./error";
import { Gimme, Refine } from "./gimme";

export class GimmeFunc extends Gimme<Function> {
    protected spawn(refine: (refiner: Refine<Function>) => void): void {
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
}
