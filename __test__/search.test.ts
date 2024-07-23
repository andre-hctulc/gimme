import g from "../src";

describe("gimme.search()", () => {
    const Schema = g.search({
        name: g.str(),
        age: g.num().coerce(),
        address: g
            .obj({
                street: g.str(),
                city: g.str(),
            })
            .nullable(),
    });
    const search = new URLSearchParams();
    search.append("name", "John");
    search.append("age", "22");
    const emptySearch = new URLSearchParams();

    it("Infer type", () => {
        type ShouldBeSearchParams = g.Infer<typeof Schema>;
    });

    it("Parses", () => {
        expect(Schema.parse(search) instanceof URLSearchParams).toBe(true);
    });

    it("Prohibits", () => {
        expect(Schema.ok("true")).toBe(false);
        expect(Schema.ok(1)).toBe(false);
        expect(Schema.ok(emptySearch)).toBe(false);
        expect(Schema.ok({ name: "John", age: 22 })).toBe(false);
    });

    it("Refines", () => {
        // min props
        expect(Schema.minProps(3).ok(search)).toBe(false);
        expect(Schema.minProps(1).ok(search)).toBe(true);
        // max props
        expect(Schema.maxProps(1).ok(search)).toBe(false);
        expect(Schema.maxProps(6).ok(search)).toBe(true);
    });
});
