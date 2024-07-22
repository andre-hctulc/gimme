# gimme

Schema validation library inspired from [zod](https://zod.dev/).

## Usage

```ts
const Schema = gimme.str();

try {
    const str = Schema.parse(param);
} catch (err) {
    // Error handling
}

// Or (these do not throw errors)
const { data, errors } = Schema.parseSafe(param);
const ok: boolean = Schema.ok(param);
const errors: GimmeError[] = Schema.getErrors(param);
```

### Examples

`string`

```ts
const name = gimme.str().parse(param);
const email = gimme.str().email().parse(param);
const severity = gimme
    .str()
    .enum(["info", "error", "warning", "success"] as const)
    .parse(param);
```

`boolean`

```ts
const ok = gimme.bool().parse(param);
const flag = gimme.bool().coerce().parse(param);
```

`number`

```ts
const age = gimme.num().parse(param);
const range = gimme.num().min(2).max(4).parse(param);
const type = gimme
    .num()
    .enum([2, 4, 5] as const)
    .parse(param);
```

`object`

```ts
const user = gimme
    .obj({
        name: gimme.str(),
        age: gimme.num().optional(),
        isAdmin: gimme.bool(),
    })
    .parse(param);
```

`Array`

```ts
const names = gimme.arr(gimme.str());
const namesRange = gimme.arr(gimme.str()).minLen(1).maxLen(20);
```

`Function`

```ts
const fct = gimme.func().parse(param);
const Factory = gimme.func().ctr().parse(param);
const fetcher = gimme.func().primitive().parse(param);
```

`Symbol`

```ts
const symbol = gimme.sym().parse(param);
```

`any`

```ts
const data = gimme.any().parse(param);
```

`Blob`

```ts
const data = gimme.blob().parse(param);
```

`FormData`

```ts
const user = gimme
    .fd({
        name: gimme.str(),
        picture: gimme.blob().nullable(), // Make sure to use nullable instead of optional for FormData!
    })
    .parse(param);
```

### Infer TypeScript Types

```ts
const UserSchema = gimme.obj({
    name: gimme.str(),
    age: gimme.num().optional(),
    isAdmin: gimme.bool(),
});

type User = gimme.infer<typeof UserSchema>;
```
