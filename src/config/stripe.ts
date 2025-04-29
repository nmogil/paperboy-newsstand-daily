// Stripe configuration
export const STRIPE_CONFIG = {
  // Replace these with your actual Stripe keys
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'YOUR_PUBLISHABLE_KEY',
  priceId: process.env.STRIPE_PRICE_ID || 'YOUR_PRICE_ID',
  
  // Product configuration
  product: {
    name: 'Paperboy Premium',
    description: 'Premium subscription for Paperboy',
    features: [
      'Unlimited access to all articles',
      'Personalized news feed',
      'Ad-free experience',
      'Early access to new features'
    ]
  }
}; 