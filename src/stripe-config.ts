export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1SstLZ0HuE4BaZkf4ZFJmqet',
    name: 'Key Vault Pro',
    description: 'Unlock Vault Pro: Lifetime access to unlimited secret storage, advanced masking features, and priority developer support.',
    mode: 'payment',
    price: 5.00,
    currency: 'usd'
  }
];