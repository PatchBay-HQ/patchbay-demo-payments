"use strict";

/**
 * In-memory Stripe fake that models charge-creation behavior *per API version*.
 * This is the mechanism the PatchBay sandbox uses to reproduce a breaking
 * change deterministically: set STRIPE_API_VERSION to the new version and the
 * removed `source` field is rejected exactly as the real API would.
 */
class StripeInvalidRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "StripeInvalidRequestError";
    this.type = "StripeInvalidRequestError";
  }
}

function versionAtLeast(version, target) {
  if (!version) return false;
  return String(version) >= String(target); // ISO date strings sort correctly
}

function makeFakeStripe({ apiVersion = process.env.STRIPE_API_VERSION } = {}) {
  const sourceRemoved = versionAtLeast(apiVersion, "2026-06-30");
  let seq = 0;

  return {
    apiVersion,
    charges: {
      async create(params = {}) {
        if (sourceRemoved && "source" in params) {
          throw new StripeInvalidRequestError(
            "Received unknown parameter: source"
          );
        }
        if (sourceRemoved && !params.payment_method) {
          throw new StripeInvalidRequestError(
            "Missing required param: payment_method"
          );
        }
        if (!sourceRemoved && !params.source && !params.payment_method) {
          throw new StripeInvalidRequestError(
            "Must provide source or payment_method"
          );
        }
        return {
          id: `ch_${++seq}`,
          object: "charge",
          amount: params.amount,
          currency: params.currency || "usd",
          captured: params.capture_method !== "manual",
          payment_method: params.payment_method || params.source || null,
          status: "succeeded",
        };
      },
    },
  };
}

module.exports = { makeFakeStripe, StripeInvalidRequestError };
