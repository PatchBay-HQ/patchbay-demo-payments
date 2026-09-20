"use strict";

const { createCharge } = require("../src/billing/createCharge");
const { makeFakeStripe } = require("./fakeStripe");

describe("charge behavior", () => {
  const token = { id: "tok_mastercard" };

  test("captures automatically by default", async () => {
    const stripe = makeFakeStripe();
    const charge = await createCharge(stripe, { token, amount: 100 });
    expect(charge.captured).toBe(true);
  });

  test("charge object is well-formed", async () => {
    const stripe = makeFakeStripe();
    const charge = await createCharge(stripe, { token, amount: 100 });
    expect(charge.object).toBe("charge");
  });

  test("distinct charges get distinct ids", async () => {
    const stripe = makeFakeStripe();
    const a = await createCharge(stripe, { token, amount: 100 });
    const b = await createCharge(stripe, { token, amount: 200 });
    expect(a.id).not.toBe(b.id);
  });

  test("large amounts are supported", async () => {
    const stripe = makeFakeStripe();
    const charge = await createCharge(stripe, { token, amount: 10_000_00 });
    expect(charge.amount).toBe(1_000_000);
  });
});
