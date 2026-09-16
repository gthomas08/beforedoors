# Local AgentMail component

This is the BeforeDoors-maintained copy of `@agentmail/convex` 0.1.0.

The component is kept local so its Convex environment contract can be maintained
alongside the app. `convex.config.ts` declares the AgentMail credentials and the
app binds them from its deployment environment. Run `npx convex dev` from the
backend package after changing the component so its `_generated` files stay in
sync.

The client runtime files under `client/` and `component/` are the package's
published runtime pieces used by the app's webhook and send wrappers.
