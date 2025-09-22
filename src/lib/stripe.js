import { loadStripe } from "@stripe/stripe-js"

// Configuración de Stripe
let stripePromise = null

export const getStripe = (publishableKey) => {
  if (!stripePromise && publishableKey) {
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

// Funciones para manejar pagos
export const crearPaymentIntent = async (amount, currency = "eur", metadata = {}) => {
  try {
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Stripe usa centavos
        currency,
        metadata,
      }),
    })

    if (!response.ok) {
      throw new Error("Error creando payment intent")
    }

    return await response.json()
  } catch (error) {
    console.error("Error en crearPaymentIntent:", error)
    throw error
  }
}

export const confirmarPago = async (paymentIntentId, paymentMethodId) => {
  try {
    const response = await fetch("/api/confirm-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment_intent_id: paymentIntentId,
        payment_method_id: paymentMethodId,
      }),
    })

    if (!response.ok) {
      throw new Error("Error confirmando pago")
    }

    return await response.json()
  } catch (error) {
    console.error("Error en confirmarPago:", error)
    throw error
  }
}

// Utilidades para formatear montos
export const formatearMonto = (amount, currency = "EUR") => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

// Validar configuración de Stripe
export const validarConfiguracionStripe = (config) => {
  const errores = []

  if (!config.publishableKey || !config.publishableKey.startsWith("pk_")) {
    errores.push("Clave pública de Stripe inválida")
  }

  if (!config.secretKey || !config.secretKey.startsWith("sk_")) {
    errores.push("Clave secreta de Stripe inválida")
  }

  return {
    valida: errores.length === 0,
    errores,
  }
}
