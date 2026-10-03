const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');

// Exercise the actual route handlers without calling Shopify or taking a payment.
function load(file, dependencies, env = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, file), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports, module: { exports }, Response, Buffer,
    process: { env }, console: { error() {}, warn() {} },
    require: (name) => name in dependencies ? dependencies[name] : require(name),
  });
  return exports;
}

const variantId = 'gid://shopify/ProductVariant/123';
const variant = {
  id: variantId, availableForSale: true, quantityAvailable: 10,
  price: { amount: '999.50', currencyCode: 'INR' }, product: { requiresSellingPlan: false },
};
const request = (body) => ({ text: async () => JSON.stringify(body), json: async () => body });

function createHandler(overrides = {}) {
  const orders = [];
  const route = load('create-order/route.ts', {
    '@/lib/razorpay': {
      isRazorpayConfigured: () => overrides.configured ?? true,
      getRazorpayKeyId: () => 'rzp_test_example',
      createRazorpayOrder: async (params) => {
        orders.push(params);
        return { id: 'order_test', ...params };
      },
    },
    '@/lib/shopify-storefront': { getCheckoutVariants: async () => overrides.variants ?? [variant] },
  });
  return { post: route.POST, orders };
}

test('ignores a forged browser total and charges trusted prices in paise', async () => {
  const { post, orders } = createHandler();
  const res = await post(request({ amount: 1, currency: 'USD', items: [{ variantId, quantity: 1 }] }));
  assert.equal(res.status, 200);
  assert.equal(orders[0].amount, 114850);
  assert.equal(orders[0].currency, 'INR');
  assert.equal((await res.json()).orderId, 'order_test');
});

test('free shipping starts exactly at the INR 1999 threshold', async () => {
  const { post, orders } = createHandler();
  await post(request({ items: [{ variantId, quantity: 2 }] }));
  assert.equal(orders[0].amount, 199900);
});

test('rejects demo, fractional, duplicate, empty, and amount-only carts before payment', async () => {
  for (const body of [
    { amount: 1 }, { items: [] },
    { items: [{ variantId: 'gid://shopify/ProductVariant/fallback-1', quantity: 1 }] },
    { items: [{ variantId, quantity: 0.5 }] },
    { items: [{ variantId, quantity: 1 }, { variantId, quantity: 1 }] },
  ]) {
    const { post, orders } = createHandler();
    assert.equal((await post(request(body))).status, 400);
    assert.equal(orders.length, 0);
  }
});

test('missing credentials, unavailable stock, subscriptions, and other currencies do not create orders', async () => {
  for (const [overrides, status] of [
    [{ configured: false }, 503],
    [{ variants: [] }, 409],
    [{ variants: [{ ...variant, quantityAvailable: 0 }] }, 409],
    [{ variants: [{ ...variant, product: { requiresSellingPlan: true } }] }, 400],
    [{ variants: [{ ...variant, price: { amount: '1.00', currencyCode: 'USD' } }] }, 400],
  ]) {
    const { post, orders } = createHandler(overrides);
    assert.equal((await post(request({ items: [{ variantId, quantity: 1 }] }))).status, status);
    assert.equal(orders.length, 0);
  }
});

test('invalid JSON returns a client error', async () => {
  const { post } = createHandler();
  assert.equal((await post({ text: async () => '{' })).status, 400);
});

test('signature helper rejects malformed and tampered callbacks without throwing', () => {
  const secret = 'test-secret';
  const { verifyRazorpaySignature } = load('../../../lib/razorpay.ts', {
    'server-only': {}, razorpay: class {},
  }, { RAZORPAY_KEY_ID: 'rzp_test_example', RAZORPAY_KEY_SECRET: secret });
  const params = { orderId: 'order_example', paymentId: 'pay_example' };
  const signature = crypto.createHmac('sha256', secret).update('order_example|pay_example').digest('hex');
  assert.equal(verifyRazorpaySignature({ ...params, signature }), true);
  assert.equal(verifyRazorpaySignature({ ...params, paymentId: 'pay_other', signature }), false);
  assert.equal(verifyRazorpaySignature({ ...params, signature: 'short' }), false);
});

test('verification requires a captured payment, not only a correct signature', async () => {
  for (const captured of [false, true]) {
    const { POST } = load('verify/route.ts', { '@/lib/razorpay': {
      isRazorpayConfigured: () => true,
      verifyRazorpaySignature: () => true,
      isRazorpayPaymentCaptured: async () => captured,
    } });
    const res = await POST(request({ orderId: 'order_example', paymentId: 'pay_example', signature: 'a'.repeat(64) }));
    assert.equal(res.status, captured ? 200 : 409);
    assert.equal((await res.json()).success, captured);
  }
});
