"use strict";

const { createCharge } = require("../src/billing/createCharge");
const { makeFakeStripe } = require("./fakeStripe");

// Tests run against whatever STRIPE_API_VERSION is set in the environment.
// On the OLD behavior they pass; the PatchBay sandbox re-runs them with
// STRIPE_API_VERSION=2026-06-30 to reproduce the break, then again after the
// patch to verify green.

describe("createCharge", () => {
  const token = { id: "tok_visa" };

  test("creates a charge for a valid token and amount", async () => {
    const stripe = makeFakeStripe();
    const charge = await createCharge(stripe, { token, amount: 1999 });
    expect(charge.status).toBe("succeeded");
  });

  test("returns a charge id", async () => {
    const stripe = makeFakeStripe();
    const charge = await createCharge(stripe, { token, amount: 500 });
    expect(charge.id).toMatch(/^ch_/);
  });

  test("passes through the amount", async () => {
    const stripe = makeFakeStripe();
    const charge = await createCharge(stripe, { token, amount: 4200 });
    expect(charge.amount).toBe(4200);
  });

  test("defaults currency to usd", async () => {
    const stripe = makeFakeStripe();
    const charge = await createCharge(stripe, { token, amount: 100 });
    expect(charge.currency).toBe("usd");
  });

  test("honors an explicit currency", async () => {
    const stripe = makeFakeStripe();
    const charge = await createCharge(stripe, { token, amount: 100, currency: "eur" });
    expect(charge.currency).toBe("eur");
  });

  test("associates the payment instrument with the charge", async () => {
    const stripe = makeFakeStripe();
    const charge = await createCharge(stripe, { token, amount: 100 });
    expect(charge.payment_method).toBe("tok_visa");
  });

  test("rejects a missing token", async () => {
    const stripe = makeFakeStripe();
    await expect(createCharge(stripe, { amount: 100 })).rejects.toThrow(
      /payment token is required/
    );
  });

  test("rejects a token without an id", async () => {
    const stripe = makeFakeStripe();
    await expect(
      createCharge(stripe, { token: {}, amount: 100 })
    ).rejects.toThrow(/payment token is required/);
  });

  test("rejects a zero amount", async () => {
    const stripe = makeFakeStripe();
    await expect(
      createCharge(stripe, { token, amount: 0 })
    ).rejects.toThrow(/positive integer/);
  });

  test("rejects a negative amount", async () => {
    const stripe = makeFakeStripe();
    await expect(
      createCharge(stripe, { token, amount: -50 })
    ).rejects.toThrow(/positive integer/);
  });

  test("rejects a non-integer amount", async () => {
    const stripe = makeFakeStripe();
    await expect(
      createCharge(stripe, { token, amount: 12.5 })
    ).rejects.toThrow(/positive integer/);
  });
});
