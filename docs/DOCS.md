# Docs

## Caveats

-   Type inference blurry when using transformers or nullable/optional:
    ```ts
    // This produces a type error because `optional()` strips `GimmeString` class spec
    const s = gimme.str().optional().email();
    // Workaround
    const t = gimme.str().email().optional();
    // Using `as()`
    const k = gimme.str().optional().email().as<Gimme<string | undefined>>();
    ```
