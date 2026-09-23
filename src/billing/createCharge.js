"use strict";

/**
 * acme/payments — charge creation.
 *
 * NOTE: this file targets the pre-2026-06-30 Stripe charge API, which accepted
 * a top-level `source` on charge creation. When Stripe removes `source` in
 * favor of `payment_method`, the call below starts failing. This is exactly the
 * usage PatchBay's detector flags and its patcher migrates.
 */

/**
 * @param {import('stripe').Stripe} stripe
 * @param {{ token: { id: string }, amount: number, currency?: string }} input
 */
async function createCharge(stripe, { token, amount, currency = "usd" }) {
  if (!token || !token.id) throw new Error("a payment token is required");
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("amount must be a positive integer (in minor units)");
  }

  const charge = await stripe.charges.create({
    amount,
    currency,
    payment_method: token.id,
    description: "acme/payments charge",
  });

  return charge;
}

module.exports = { createCharge };
