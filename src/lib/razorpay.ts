/**
 * Razorpay server-side utilities (server-only)
 * Creates orders and verifies payment signatures.
 */
import "server-only";
import crypto from "crypto";
import Razorpay from "razorpay";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

export function isRazorpayConfigured(): boolean {
  return Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
}

export function getRazorpayKeyId(): string {
  if (!isRazorpayConfigured()) throw new Error("Payments are not configured.");
  return RAZORPAY_KEY_ID;
}

let _razorpay: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!isRazorpayConfigured()) throw new Error("Payments are not configured.");
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
}

export interface CreateOrderParams {
  /** Amount in paise (INR) */
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export async function createRazorpayOrder(
  params: CreateOrderParams
): Promise<RazorpayOrder> {
  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: params.amount,
    currency: params.currency ?? "INR",
    receipt: params.receipt ?? `receipt_${Date.now()}`,
    notes: params.notes ?? {},
  });
  return order as unknown as RazorpayOrder;
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!isRazorpayConfigured() || !/^[a-f0-9]{64}$/i.test(params.signature)) return false;
  const body = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body)
    .digest();
  return crypto.timingSafeEqual(expectedSignature, Buffer.from(params.signature, "hex"));
}

/** A valid callback signature alone does not establish that money was captured. */
export async function isRazorpayPaymentCaptured(orderId: string, paymentId: string): Promise<boolean> {
  const razorpay = getRazorpay();
  const [order, payment] = await Promise.all([
    razorpay.orders.fetch(orderId),
    razorpay.payments.fetch(paymentId),
  ]);
  return payment.order_id === order.id &&
    order.notes?.source === "no-nonsense-store" &&
    payment.status === "captured" &&
    payment.captured &&
    payment.currency === order.currency &&
    Number(payment.amount) === Number(order.amount) &&
    Number(payment.amount_refunded ?? 0) === 0;
}
