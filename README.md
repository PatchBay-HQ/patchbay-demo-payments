# acme/payments (PatchBay demo repo)

A deliberately small Node billing service used to demonstrate the full PatchBay
loop end-to-end. It creates Stripe charges using the pre-2026-06-30 API shape:

```js
stripe.charges.create({ amount, currency, source: token.id })
```

When Stripe's `2026-06-30` version removes the top-level `source` field, this
code breaks. PatchBay:

1. **detects** the `source:` usage inside a `charges.create(...)` call,
2. **reproduces** the failure by running the 15 Jest tests with
   `STRIPE_API_VERSION=2026-06-30` (the in-memory Stripe fake rejects `source`),
3. **patches** `source` → `payment_method`,
4. **verifies** the tests pass again, and
5. opens a **PR**.

The Stripe fake (`test/fakeStripe.js`) models charge-creation behavior per API
version, so the break is deterministic and needs no network or real key.

```bash
npm install          # installs jest
npm test             # 15 passing on the old behavior
STRIPE_API_VERSION=2026-06-30 npm test   # fails — the reproduced break
```
