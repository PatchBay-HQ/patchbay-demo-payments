"use strict";

/**
 * Thin wrapper that constructs the Stripe client. In tests this is replaced by
 * an in-memory fake (see test/fakeStripe.js) so no network or real key is
 * needed — the fake models the API version's behavior, which is what lets the
 * sandbox reproduce a breaking change deterministically.
 */
function makeStripe(apiKey = process.env.STRIPE_SECRET_KEY) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Stripe = require("stripe");
  return new Stripe(apiKey, { apiVersion: process.env.STRIPE_API_VERSION });
}

module.exports = { makeStripe };
