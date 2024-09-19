import g from "../src";

describe("gimme.blob()", () => {
    const Schema = g.blob();

    it("Infers", () => {
        type ShouldBeBlob = g.Infer<typeof Schema>;
        const OtionalSchema = Schema.optional();
        type TypeOptional = g.Infer<typeof OtionalSchema>;
    });

    const blob = new Blob(["hello"], { type: "text/plain" });

    it("Parses", () => {
        expect(Schema.parse(blob)).toBe(blob);
    });

    it("Prohibits", () => {
        expect(() => Schema.parse(undefined)).toThrow();
        expect(() => Schema.parse(null)).toThrow();
        expect(() => Schema.parse(33)).toThrow();
        expect(() => Schema.parse(true)).toThrow();
    });

    it("Coerces", () => {
        expect(Schema.coerce().parse(blob)).toBe(blob);
    });

    it("Refines", () => {
        // min size
        expect(() => Schema.minSize(500).parse(blob)).toThrow();
        expect(Schema.minSize(1).ok(blob)).toBe(true);
        // max size
        expect(() => Schema.maxSize(2).parse(blob)).toThrow();
        expect(Schema.maxSize(40).ok(blob)).toBe(true);
        // mime type
        expect(() => Schema.mimeType("application/json").parse(blob)).toThrow();
        expect(Schema.mimeType("text/plain").ok(blob)).toBe(true);
    });
});
