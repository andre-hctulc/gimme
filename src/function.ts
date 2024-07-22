import { GimmeTypeError } from "./error";
import { Gimme, Spawner } from "./gimme";

export class GimmeFunc extends Gimme<Function> {
    protected spawn(refine: Spawner<Function>): void {
        refine((data) => {
            if (typeof data !== "function") throw new GimmeTypeError("function", data);
            return data as Function;
        });
    }

    primitive() {
        return this.refine((data, c, skip) => {
            const str = data.toString();
            if (!str.startsWith("function") && !str.startsWith("async function"))
                throw new GimmeTypeError("primitive function", "class");
            return data as Function;
        });
    }

    ctr() {
        return this.refine((data, c, skip) => {
            const str = data.toString();
            if (!str.startsWith("class")) throw new GimmeTypeError("primitive function", "class");
            return data as Function;
        });
    }
}
