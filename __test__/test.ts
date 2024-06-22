import gimme from "../src";

const Schema = gimme.obj({
    name: gimme.str(),
    lastName: gimme.str().optional(),
    age: gimme.num().nullable(),
    isStudent: gimme.bool().optional().nullable(),
    hobbies: gimme.arr(gimme.str()),
    nested: gimme.obj({
        prop1: gimme.str(),
        prop2: gimme.num(),
    }),
});

type SchemaType = gimme.Infer<typeof Schema>;