## Fix Vercel runtime config error

**Error:** `api/index.js` declares `runtime: "nodejs20.x"`, but Vercel's `config` export only accepts `"edge"`, `"experimental-edge"`, or `"nodejs"`. The `nodejs20.x` form belongs in a different config surface (`vercel.json` `functions` block), not in the file's exported `config`.

**Fix:** change `api/index.js` so its exported config uses the valid value:

```js
export const config = {
  runtime: "nodejs",
};
```

To pin the Node.js major version (recommended, since the built SSR bundle uses modern Node APIs like `Readable.toWeb`), add an `engines` field to `package.json`:

```json
"engines": { "node": "20.x" }
```

Vercel reads `engines.node` to select the Node runtime version for all Node serverless functions.

**Files to change**
- `api/index.js` — replace `runtime: "nodejs20.x"` with `runtime: "nodejs"`.
- `package.json` — add `"engines": { "node": "20.x" }` if not already present.

**Out of scope:** no changes to the SSR handler logic, `vercel.json`, `vite.config.ts`, or any app code.

**After deploy:** redeploy on Vercel; the build should succeed and routes should render via the serverless function.