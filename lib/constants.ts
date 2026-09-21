// HeroSMS requires a minimum wait before an activation can be cancelled.
export const HEROSMS_MIN_CANCEL_SECONDS = 120;

// Safety net: if an order has been sitting "pending" longer than this, the
// provider has likely purged the activation record entirely (querying an
// old id then just errors forever instead of returning a normal status).
// Auto-refund instead of leaving it stuck in limbo.
export const MAX_PENDING_MINUTES = 30;
