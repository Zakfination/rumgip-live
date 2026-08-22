import crypto from 'node:crypto';

export type MidtransNotification = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
};

export function verifyMidtransSignature(n: MidtransNotification) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error('MIDTRANS_SERVER_KEY is not configured');

  const raw = `${n.order_id}${n.status_code}${n.gross_amount}${serverKey}`;
  const expected = crypto.createHash('sha512').update(raw).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(n.signature_key));
}

export function isSuccessfulTransaction(status: string) {
  return status === 'settlement' || status === 'capture';
}
