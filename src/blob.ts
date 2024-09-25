import { GimmeError, GimmeTypeError } from "./error";
import { Gimme, Refiner, Spawner } from "./gimme";

export class GimmeBlob extends Gimme<Blob> {
    protected spawn(refine: Spawner<Blob>): void {
        refine((data, coerce) => {
            if (!(data instanceof Blob))
                throw new GimmeTypeError("Blob", GimmeTypeError.typeof(data), {
                    userMessage: "Not a file",
                });
            return data;
        });
    }

    maxSize(size: number) {
        return this.refine((data) => {
            if ((data as Blob).size > size) throw new GimmeError({ message: "Too large. Max size: " + size });
            return data as Blob;
        });
    }

    minSize(size: number) {
        return this.refine((data) => {
            if (data.size < size) throw new GimmeError({ message: "Too small. Min size: " + size });
            return data;
        });
    }

    mimeType(...mimeType: string[]) {
        const set = new Set(mimeType);
        return this.refine((data) => {
            const mimeTypesStr = mimeType.join(",");
            if (!set.has(data.type))
                throw new GimmeTypeError("one of " + mimeTypesStr, data.type, {
                    userMessage: "Invalid file type. Expected one of " + mimeTypesStr,
                });
            return data;
        });
    }
}
