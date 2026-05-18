import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 },
});

export async function criarPixPayment(
  amount: number,
  description: string,
  externalReference: string
) {
  const payment = new Payment(client);

  const result = await payment.create({
    body: {
      transaction_amount: amount,
      description,
      payment_method_id: "pix",
      external_reference: externalReference,
      date_of_expiration: new Date(Date.now() + 60 * 60 * 24 * 2 * 1000).toISOString(),
      payer: { email: "comprador@matchday.app" },
    },
  });

  const pixData = result.point_of_interaction?.transaction_data;

  return {
    id: result.id,
    status: result.status,
    qrCode: pixData?.qr_code ?? null,
    qrCodeBase64: pixData?.qr_code_base64 ?? null,
    ticketUrl: pixData?.ticket_url ?? null,
    pixCode: pixData?.qr_code ?? null,
  };
}

export async function buscarPagamento(paymentId: number) {
  const payment = new Payment(client);
  const result = await payment.get({ id: paymentId });
  return {
    id: result.id,
    status: result.status,
    statusDetail: result.status_detail,
    externalReference: result.external_reference,
    paidAt: result.date_approved,
  };
}
