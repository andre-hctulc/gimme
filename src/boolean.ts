import { GimmeTypeError } from "./error";
import { Gimme, Spawner } from "./gimme";

export class GimmeBool extends Gimme<boolean> {
    protected spawn(refine: Spawner<boolean>): void {
        refine((data, coerce) => {
            if (coerce) return Boolean(data);
            if (typeof data !== "boolean")
                throw new GimmeTypeError("boolean", GimmeTypeError.typeof(data), {
                    userMessage: "Expected true or false",
                });
            return data as boolean;
        });
    }
}
