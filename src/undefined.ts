import { GimmeTypeError } from "./error";
import { Gimme, Spawner } from "./gimme";

export class GimmeUndefined extends Gimme<undefined> {
    protected spawn(refine: Spawner<undefined>): void {
        refine((data) => {
            if (data !== undefined)
                throw new GimmeTypeError("undefined", GimmeTypeError.typeof(data), {
                    userMessage: "Expected undefined",
                });
            return data;
        });
    }
}
