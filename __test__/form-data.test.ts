import gimme from "../src";

describe("gimme.formdata()", () => {
    const Schema = gimme.obj({
        name: gimme.str(),
        age: gimme.num(),
        address: gimme
            .obj({
                street: gimme.str(),
                city: gimme.str(),
            })
            .optional(),
    });
    const fd = new FormData();
    fd.append("name", "John");
    fd.append("age", "22");
    const emptyFd = new FormData();

    it("Infer type", () => {
        type ShouldBeObject = gimme.Infer<typeof Schema>;
    });

    it("Parses", () => {
        expect(Schema.ok(fd)).toBe(true);
    });

    it("Prohibits", () => {
        expect(Schema.ok("true")).toBe(false);
        expect(Schema.ok(1)).toBe(false);
        expect(Schema.ok({ name: "John", age: 22 })).toBe(false);
    });

    it("Refines", () => {
        // min props
        expect(Schema.minProps(3).ok(obj)).toBe(false);
        expect(Schema.minProps(1).ok(obj)).toBe(true);
        // max props
        expect(Schema.maxProps(1).ok(obj)).toBe(false);
        expect(Schema.maxProps(6).ok(obj)).toBe(true);
        // len
        expect(Schema.len(1).ok(obj)).toBe(false);
        expect(Schema.len(2).ok(obj)).toBe(true);
    });
});
