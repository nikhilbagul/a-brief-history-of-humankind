export const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Small overshoot used when a checkpoint lights up. */
export const popScale = t => (t >= 1 ? 1 : 1 + Math.sin(t * Math.PI) * 0.18 * (1 - t));

/** Frame-rate independent damping factor for `x += (target - x) * k`. */
export const damp = (rate, dt) => 1 - Math.exp(-rate * dt);

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const nowSeconds = () => performance.now() / 1000;
