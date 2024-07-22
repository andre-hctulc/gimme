import gimme from "../src";

describe("Gimme", () => {
    const StrSchema = gimme.str();
    const NumSchema = gimme.num();

    it("Infers", () => {
        const OptionalSchema = gimme.str().optional();
        const NullableSchema = gimme.str().nullable();
        const OptionalNullableSchema = gimme.str().optional().nullable();
        type SchemaType = gimme.Infer<typeof StrSchema>;
        type OptionalSchemaType = gimme.Infer<typeof OptionalSchema>;
        type NullableSchemaType = gimme.Infer<typeof NullableSchema>;
        type OptionalNullableSchemaType = gimme.Infer<typeof OptionalNullableSchema>;
    });

    it("Parses", () => {
        // parse safe
        expect(StrSchema.regex(/never/).url().parseSafe(55, true).errors?.length).toBe(3);
        expect(StrSchema.email().url().parseSafe("str", true).errors?.length).toBe(2);
        expect(StrSchema.parseSafe(3).errors?.length).toBe(1);
        // optional
        expect(StrSchema.optional().parse(undefined)).toBeUndefined();
        expect(StrSchema.optional().parse("undefined")).toBe("undefined");
        // nullable
        expect(StrSchema.nullable().parse(null)).toBeNull();
        expect(StrSchema.nullable().parse("null")).toBe("null");
        // Or
        const OrSchema = gimme.num().or(gimme.str());
        expect(OrSchema.ok(2)).toBe(true);
        expect(OrSchema.ok("2")).toBe(true);
        expect(OrSchema.ok(true)).toBe(false);
        // And
        const AndSchema = gimme.obj({ s: gimme.str() }).and(gimme.obj({ n: gimme.num() }));
        expect(AndSchema.ok({ s: "test" })).toBe(false);
        expect(AndSchema.ok({ n: 4 })).toBe(false);
        expect(AndSchema.ok({ n: 4, s: "test" })).toBe(true);
    });

    it("Refines", () => {
        // Values
        expect(NumSchema.values([1, 2, 3]).ok(3)).toBe(true);
        expect(NumSchema.values([1, 2, 3]).ok(4)).toBe(false);
    });
});
