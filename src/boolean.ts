import { GimmeTypeError } from "./error";
import { Gimme, Refine } from "./gimme";

export class GimmeBool extends Gimme<boolean> {
    protected spawn(refine: (refiner: Refine<boolean>) => void): void {
        refine((data, coerce) => {
            if (coerce) return Boolean(data);
            if (typeof data !== "boolean") throw new GimmeTypeError("boolean", data);
            return data as boolean;
        });
    }
}
