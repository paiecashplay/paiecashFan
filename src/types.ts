/**
 * Type definitions for PaieCashFan Application
 */

/**
 * Cloudflare Workers Bindings
 * Environment variables and services available in the Workers environment
 */
export interface Bindings {
  // D1 Database
  DB: D1Database
  
  // Stripe Payment
  STRIPE_SECRET_KEY?: string
  
  // Lyra (PayZen) Payment
  LYRA_API_URL?: string
  LYRA_USERNAME?: string
  LYRA_PASSWORD?: string
  LYRA_PUBLIC_KEY?: string
  
  // Resend Email
  RESEND_API_KEY?: string
  
  // Optional: KV, R2, etc.
  KV?: KVNamespace
  R2?: R2Bucket
}

/**
 * Alias for backwards compatibility
 */
export type CloudflareBindings = Bindings
export type CloudflareEnv = Bindings
