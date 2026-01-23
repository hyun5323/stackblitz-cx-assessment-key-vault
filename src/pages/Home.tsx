@@ .. @@
 import React from 'react'
 import { Link } from 'react-router-dom'
-import { KeyRound, Shield, Lock, Zap } from 'lucide-react'
+import { KeyRound, Shield, Lock, Zap, Crown } from 'lucide-react'
+import { useAuth } from '../hooks/useAuth'
+import { useUserProfile } from '../hooks/useUserProfile'
 
 export function Home() {
+  const { user } = useAuth()
+  const { profile } = useUserProfile()
+
   return (
     <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
       {/* Hero Section */}
@@ .. @@
             <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
               Securely store and manage your API keys, environment variables, and sensitive data with military-grade encryption and intuitive organization.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
-              <Link
-                to="/auth"
-                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
-              >
-                Get Started Free
-              </Link>
+              {user ? (
+                <Link
+                  to="/dashboard"
+                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
+                >
+                  Go to Dashboard
+                </Link>
+              ) : (
+                <Link
+                  to="/auth"
+                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
+                >
+                  Get Started Free
+                </Link>
+              )}
               <Link
-                to="/auth"
+                to="/pricing"
                 className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg font-semibold transition-colors"
               >
-                Learn More
+                View Pricing
               </Link>
             </div>
+            {profile?.is_pro && (
+              <div className="mt-4 flex items-center justify-center space-x-2 text-amber-600">
+                <Crown className="w-5 h-5" />
+                <span className="font-medium">You have Pro access!</span>
+              </div>
+            )}
           </div>
         </div>
       </section>
@@ .. @@
       {/* CTA Section */}
       <section className="bg-indigo-600 py-16">
         <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
           <h2 className="text-3xl font-bold text-white mb-4">
             Ready to secure your secrets?
           </h2>
           <p className="text-xl text-indigo-100 mb-8">
             Join thousands of developers who trust Key Stash with their sensitive data.
           </p>
-          <Link
-            to="/auth"
-            className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
-          >
-            Start Free Today
-          </Link>
+          {user ? (
+            <div className="space-x-4">
+              <Link
+                to="/dashboard"
+                className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
+              >
+                Go to Dashboard
+              </Link>
+              {!profile?.is_pro && (
+                <Link
+                  to="/pricing"
+                  className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
+                >
+                  Upgrade to Pro
+                </Link>
+              )}
+            </div>
+          ) : (
+            <Link
+              to="/auth"
+              className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
+            >
+              Start Free Today
+            </Link>
+          )}
         </div>
       </section>
     </div>
   )
 }