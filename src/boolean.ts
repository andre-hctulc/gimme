import { GimmeTypeError } from "./error";
import { Gimme } from "./gimme";

export class GimmeBool extends Gimme<boolean> {
    constructor() {
        super();
        this.spawn((data, coerce) => {
            if (coerce) return Boolean(data);
            if (typeof data !== "boolean") throw new GimmeTypeError("boolean", data);
            return data as boolean;
        });
    }
}
