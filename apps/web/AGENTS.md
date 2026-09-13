# React conditional rendering

- Use `condition && <Component />` when content is optional and there is no alternate branch.
- Use `condition ? <A /> : <B />` when exactly one of two alternatives should render, or when selecting between two values.
- For JSX with several mutually exclusive, switch-like states, render each case with its own `condition && <Component />` branch. Make the conditions explicitly exclusive.
- Keep ternaries shallow. For non-JSX selection among three or more states or nested branching, use early returns, a lookup, or a focused component.
- Do not replace a two-way ternary with paired positive/negative `&&` expressions, or use `condition && value || fallback`; those obscure two-way exclusivity and can mishandle falsey values.
