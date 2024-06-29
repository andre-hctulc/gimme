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

// Or
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
const flag = gimme.bool().parse(param);
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

`array`

```ts
const names = gimme.arr(gimme.str());
const namesRange = gimme.arr(gimme.str()).minLen(1).maxLen(20);
```

`function`

```ts
const fct = gimme.func().parse(param);
const Factory = gimme.func().ctr().parse(param);
const fetcher = gimme.func().primitive().parse(param);
```

`symbol`

```ts
const sym = gimme.sym().parse(param);
```

`any`

```ts
const data = gimme.any().parse(param);
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
