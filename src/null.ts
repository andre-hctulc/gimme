import { GimmeTypeError } from "./error";
import { Gimme, Spawner } from "./gimme";

export class GimmeNull extends Gimme<null> {
    protected spawn(refine: Spawner<null>): void {
        refine((data) => {
            if (data !== null)
                throw new GimmeTypeError("null", GimmeTypeError.typeof(data), {
                    userMessage: "Expected null",
                });
            return data;
        });
    }
}
