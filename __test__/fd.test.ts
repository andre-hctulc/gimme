import g from "../src";

describe("gimme.fd()", () => {
    const Schema = g.fd({
        name: g.str(),
        age: g.num().coerce(),
        address: g
            .obj({
                street: g.str(),
                city: g.str(),
            })
            .nullable(),
    });
    const fd = new FormData();
    fd.append("name", "John");
    fd.append("age", "22");
    const emptyFd = new FormData();

    it("Infer type", () => {
        type ShouldBeFormData = g.Infer<typeof Schema>;
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
