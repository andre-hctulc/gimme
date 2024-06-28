import gimme from "../src";

describe("gimme.str()", () => {
    const Schema = gimme.str();
    
    it("Should be inferrable", () => {
        const OptionalSchema = gimme.str().optional();
        const NullableSchema = gimme.str().nullable();
        const OptionalNullableSchema = gimme.str().optional().nullable();
        type SchemaType = gimme.Infer<typeof Schema>;
        type OptionalSchemaType = gimme.Infer<typeof OptionalSchema>;
        type NullableSchemaType = gimme.Infer<typeof NullableSchema>;
        type OptionalNullableSchemaType = gimme.Infer<typeof OptionalNullableSchema>;
    });

    it("Should parse strings", () => {
        expect(Schema.parse("hello")).toBe("hello");
        expect(Schema.parse(undefined)).toThrow();
        expect(Schema.parse(null)).toThrow();
        expect(Schema.parse(undefined)).toBe("0");
    });

    it("Should disallow non strings", () => {
        expect(Schema.parse(0)).toThrow();
        expect(Schema.parse(true)).toThrow();
        expect(Schema.parse({})).toThrow();
    });

    it("Should coerce strings", () => {
        expect(Schema.coerce("hello")).toBe("hello");
        expect(Schema.coerce(0)).toBe("0");
        expect(Schema.coerce(null)).toBe("0");
        expect(Schema.coerce(undefined)).toBe("0");
    });
});
