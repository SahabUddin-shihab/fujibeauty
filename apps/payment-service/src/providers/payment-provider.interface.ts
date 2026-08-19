export interface ChargeInput {
  orderId: string;
  amount: number; 
  currency: string;
  paymentMethodId?: string;
}

export interface ChargeResult {
  transactionRef: string;
}

export interface PaymentProvider {
  charge(input: ChargeInput): Promise<ChargeResult>;
}
