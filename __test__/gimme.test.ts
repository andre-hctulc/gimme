import gimme from "../src";

describe("Gimme", () => {
    const StrSchema = gimme.str();
    const NumSchema = gimme.num();

    it("Infer type", () => {
        const OptionalSchema = gimme.str().optional();
        const NullableSchema = gimme.str().nullable();
        const OptionalNullableSchema = gimme.str().optional().nullable();
        type SchemaType = gimme.Infer<typeof StrSchema>;
        type OptionalSchemaType = gimme.Infer<typeof OptionalSchema>;
        type NullableSchemaType = gimme.Infer<typeof NullableSchema>;
        type OptionalNullableSchemaType = gimme.Infer<typeof OptionalNullableSchema>;
    });

    it("Optional/Nullable", () => {
        // optional
        expect(StrSchema.optional().parse(undefined)).toBeUndefined();
        expect(StrSchema.optional().parse("undefined")).toBe("undefined");
        // nullable
        expect(StrSchema.nullable().parse(null)).toBeNull();
        expect(StrSchema.nullable().parse("null")).toBe("null");
    });

    it("Parse safe", () => {
        expect(StrSchema.parseSafe(3).errors?.length).toBe(1);
        expect(StrSchema.email().url().parseSafe("str", true).errors?.length).toBe(2);
        expect(StrSchema.regex(/never/).url().parseSafe(55, true).errors?.length).toBe(3);
    });

    it("Special refines", () => {
        // Values
        expect(NumSchema.values([1, 2, 3]).ok(3)).toBe(true);
        expect(NumSchema.values([1, 2, 3]).ok(4)).toBe(false);
    });

    it("Or/and", () => {
        // Or
        const OrSchema = gimme.num().or(gimme.str());
        expect(OrSchema.ok(2)).toBe(true);
        expect(OrSchema.ok("2")).toBe(true);
        expect(OrSchema.ok(true)).toBe(false);

        // And
        const AndSchema = gimme.num().coerce().and(gimme.str());
        expect(AndSchema.ok(2)).toBe(false);
        expect(AndSchema.ok(true)).toBe(false);
        // This should fail, as  the secon d (string) schema receives a number (parsed from the first schema)
        expect(AndSchema.ok("2")).toBe(false);

        // And2
        const AndSchema2 = gimme.num().and(gimme.str().coerce());
        expect(AndSchema2.ok(2)).toBe(true);
    });
});
