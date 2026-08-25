# Bugbot rules for Tack

## API design

- Functions that take more than one positional numeric parameter of the same
  kind (counts, indices, durations in ms) must take a single options object
  instead, so call sites cannot silently swap arguments.

## Correctness

- Every doc comment that states a contract (units, 0- vs 1-based indexing,
  inclusive vs exclusive bounds, "the final batch may be smaller", etc.) must
  match the implementation exactly. Flag any mismatch as a bug and quote both
  the comment and the offending code.

## Store discipline

- Any change to `IssueStore` mutation methods must ship with a unit test in
  `test/` covering the new behavior, including boundary cases (empty store,
  full column, last item).
