export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_TqaWZPn5GVw8Gb',
    priceId: 'price_1SstLZ0HuE4BaZkf4ZFJmqet',
    name: 'Key Vault Pro',
    description: 'Unlock Vault Pro: Lifetime access to unlimited secret storage, advanced masking features, and priority developer support.',
    price: 5.00,
    currency: 'usd',
    mode: 'payment'
  }
];

export const formatPrice = (price: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
};