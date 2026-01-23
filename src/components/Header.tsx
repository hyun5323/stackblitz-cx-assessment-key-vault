import React from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, LogOut, Crown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'

export function Header() {
  const { user, signOut } = useAuth()
  const { profile } = useUserProfile()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <KeyRound className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Key Stash</span>
          </Link>

          <nav className="flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Dashboard
                </Link>
                {!profile?.is_pro && (
                  <Link
                    to="/pricing"
                    className="flex items-center space-x-1 text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Upgrade to Pro</span>
                  </Link>
                )}
                {profile?.is_pro && (
                  <div className="flex items-center space-x-1 text-amber-600">
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-medium">Pro</span>
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth"
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/pricing"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}