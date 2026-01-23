import React from 'react'
import { PricingCard } from '../components/PricingCard'
import { STRIPE_PRODUCTS } from '../stripe-config'
import { useUserProfile } from '../hooks/useUserProfile'
import { Loader2 } from 'lucide-react'

export function Pricing() {
  const { profile, loading } = useUserProfile()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade to Pro
          </h1>
          <p className="text-xl text-gray-600">
            Unlock advanced features and get lifetime access to Key Vault Pro
          </p>
        </div>

        <div className="flex justify-center">
          <div className="max-w-md">
            {STRIPE_PRODUCTS.map((product) => (
              <PricingCard
                key={product.id}
                product={product}
                isPro={profile?.is_pro || false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}