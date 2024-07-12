import gimme from "../src";

describe("gimme.formdata()", () => {
    const Schema = gimme.fd({
        name: gimme.str(),
        age: gimme.num().coerce(),
        address: gimme
            .obj({
                street: gimme.str(),
                city: gimme.str(),
            })
            .nullable(),
    });
    const fd = new FormData();
    fd.append("name", "John");
    fd.append("age", "22");
    const emptyFd = new FormData();

    it("Infer type", () => {
        type ShouldBeFormData = gimme.Infer<typeof Schema>;
    });

    it("Parses", () => {
        expect(Schema.parse(fd) instanceof FormData).toBe(true);
    });

    it("Prohibits", () => {
        expect(Schema.ok("true")).toBe(false);
        expect(Schema.ok(1)).toBe(false);
        expect(Schema.ok(emptyFd)).toBe(false);
        expect(Schema.ok({ name: "John", age: 22 })).toBe(false);
    });

    it("Refines", () => {
        // min props
        expect(Schema.minProps(3).ok(fd)).toBe(false);
        expect(Schema.minProps(1).ok(fd)).toBe(true);
        // max props
        expect(Schema.maxProps(1).ok(fd)).toBe(false);
        expect(Schema.maxProps(6).ok(fd)).toBe(true);
    });
});
