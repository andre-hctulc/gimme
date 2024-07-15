import gimme from "../src";

describe("gimme.search()", () => {
    const Schema = gimme.search({
        name: gimme.str(),
        age: gimme.num().coerce(),
        address: gimme
            .obj({
                street: gimme.str(),
                city: gimme.str(),
            })
            .nullable(),
    });
    const search = new URLSearchParams();
    search.append("name", "John");
    search.append("age", "22");
    const emptySearch = new URLSearchParams();

    it("Infer type", () => {
        type ShouldBeSearchParams = gimme.Infer<typeof Schema>;
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
