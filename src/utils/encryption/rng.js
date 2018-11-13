/* eslint-disable no-plusplus,no-bitwise,no-underscore-dangle,func-names */
import RC4, { POLL_SIZE } from './rc4';

const pool = Array(POLL_SIZE).fill(0);

// Initialize the pool with junk
function randomPool() {
  if (window && window.crypto && window.crypto.getRandomValues) {
    // Extract entropy (2048 bits) from RNG if available
    const r = new Uint32Array(POLL_SIZE);
    window.crypto.getRandomValues(r);

    r.forEach((value, index) => {
      if (pool[index] !== 0) {
        pool[index] &= value & 0xff;
      } else {
        pool[index] = value & 0xff;
      }
    });
  }
  return pool;
}

// Use mouse events for generate more junk
const onMouseMoveListener = function (event) {
  if (!this.__r && this.__r !== 0) {
    this.__r = 0;
  }

  // remove listener
  if (this.__r >= POLL_SIZE) {
    if (window && window.removeEventListener) {
      window.removeEventListener('mousemove', onMouseMoveListener, false);
    } else if (window && window.detachEvent) {
      window.detachEvent('onmousemove', onMouseMoveListener);
    }
    return false;
  }

  try {
    pool[this.__r] = Math.floor(event.x * event.y * Math.random()) & 0xff;
  } catch (e) {
    pool[this.__r] = Math.floor(65536 * Math.random()) & 0xff;
  }
  this.__r += 1;
  return true;
};

// use mouse events for entropy
if (window && window.addEventListener) {
  window.addEventListener('mousemove', onMouseMoveListener, false);
} else if (window && window.attachEvent) {
  window.attachEvent('onmousemove', onMouseMoveListener);
}

// Random number generator
export default class SecureRandom {
  constructor() {
    this.state = new RC4(randomPool());
    pool.fill(0);
  }

  nextBytes(size) {
    return Array(size).fill(0).map(() => this.state.next());
  }
}