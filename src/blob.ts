import { GimmeError, GimmeTypeError } from "./error";
import { Gimme, Refiner } from "./gimme";

export class GimmeBlob extends Gimme<Blob> {
    protected spawn(refine: (refiner: Refiner<Blob>) => void): void {
        refine((data, coerce) => {
            if (!(data instanceof Blob)) throw new GimmeTypeError("Blob", data);
            return data;
        });
    }

    maxSize(size: number) {
        return this.refine((data) => {
            if ((data as Blob).size > size) throw new GimmeError("Too large");
            return data as Blob;
        });
    }

    minSize(size: number) {
        return this.refine((data) => {
            if ((data as Blob).size < size) throw new GimmeError("Too small");
            return data as Blob;
        });
    }

    mimeType(...mimeType: string[]) {
        const set = new Set(mimeType);
        return this.refine((data) => {
            if (!set.has((data as Blob).type)) throw new GimmeError("Wrong mime type");
            return data as Blob;
        });
    }
}
