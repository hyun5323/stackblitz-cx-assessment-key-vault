import React from 'react'
import { PricingCard } from '../components/PricingCard'
import { STRIPE_PRODUCTS } from '../stripe-config'

export function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade Your Key Management
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Take your secret management to the next level with advanced features and lifetime access.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="max-w-md">
            {STRIPE_PRODUCTS.map((product) => (
              <PricingCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}