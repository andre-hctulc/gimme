import g from "../src";

describe("Gimme", () => {
    const StrSchema = g.str();
    const NumSchema = g.num();

    it("Infers", () => {
        const OptionalSchema = g.str().optional();
        const NullableSchema = g.str().nullable();
        const OptionalNullableSchema = g.str().optional().nullable();
        type SchemaType = g.Infer<typeof StrSchema>;
        type OptionalSchemaType = g.Infer<typeof OptionalSchema>;
        type NullableSchemaType = g.Infer<typeof NullableSchema>;
        type OptionalNullableSchemaType = g.Infer<typeof OptionalNullableSchema>;
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
        const OrSchema = g.num().or(g.str());
        expect(OrSchema.ok(2)).toBe(true);
        expect(OrSchema.ok("2")).toBe(true);
        expect(OrSchema.ok(true)).toBe(false);
        // And
        const AndSchema = g.obj({ s: g.str() }).and(g.obj({ n: g.num() }));
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
