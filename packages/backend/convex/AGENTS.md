# Convex conventions

These instructions apply to all files under `packages/backend/convex`.

## Folder structure

Keep the Convex directory organized by top-level domain modules:

```text
convex/
├── schema.ts
├── reports.ts
├── projects.ts
├── lib/
│   └── customFunctions.ts
└── _generated/
```

- Put public and internal functions for a simple domain in its top-level module, such as `reports.ts`.
- Put reusable infrastructure helpers in `lib/`.
- Do not create a model layer or extra helper methods for simple CRUD operations unless the logic is genuinely shared or complex.
- Do not edit files under `_generated/`; they are managed by Convex code generation.

## Function conventions

- Use Convex's object-form function syntax.
- Every registered function must define both `args` and `returns` validators.
- Every `returns` validator must return an object or `null`; wrap scalar and array results in an object such as `{ reportId }` or `{ items }`.
- Public functions use `publicQuery` or `publicMutation` from `./lib/customFunctions`.
- Public functions define their Zod `args` and `returns` schemas inline in the function definition.
- Internal functions use `internalQuery` or `internalMutation` from `./_generated/server`.
- Internal functions define their Convex `v` validators inline in the function definition.
- Public and internal functions for the same domain may live in the same file. Use an `Internal` suffix for internal exports when names would otherwise collide.
- Function names should include the domain model name.
- Public versus internal access is determined by the function constructor, not the filename.

## File regions

- When using editor regions in a Convex module, keep the top-level regions in this order: `Public functions`, `Internal functions`, then `Utils`.
- Do not use nested regions.
- Omit a region when it would be empty.
- Put utility constants, schemas, types, and functions in the `Utils` region.

## Validation and errors

- Use `zod` for public argument and return validation.
- Use `convex/values` validators for internal argument and return validation.
- Keep schemas inline; do not create separate schema variables for individual CRUD functions.
- Throw regular `Error` instances for current CRUD failures. Do not add Better Result handling to these functions; the `better-result` dependency is retained but currently unused.
- In actions, use Better Result's `Result.try` for synchronous fallible work and `Result.tryPromise` for asynchronous fallible work instead of native JavaScript `try/catch`. Handle the resulting `Ok`/`Err` explicitly; reserve native `try/catch` for unexpected defects such as `Panic` at a reporting or supervision boundary.
- When a function coordinates multiple steps, add concise, meaningful comments for the key stages.

## Database access

- Add indexes in `schema.ts` for frequent read conditions and query them with `.withIndex(...)`.
- Bound list reads with `.take(...)` or use pagination; avoid unbounded `.collect()` calls.
- Return `null` for an absent document where the function's return schema allows it.
- Check that documents exist before updating or deleting them.

## Verification

From `packages/backend`, run:

```sh
pnpm exec tsc --noEmit -p convex/tsconfig.json
pnpm exec convex dev --once
```

The Convex command requires network access and an authorized deployment.
