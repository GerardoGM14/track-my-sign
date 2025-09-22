"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { CreditCard, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function ComponentePagoStripe({ factura, configuracionStripe, onPagoExitoso, onPagoError }) {
  const [stripe, setStripe] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)
  const [clientSecret, setClientSecret] = useState("")

  // Datos de la tarjeta (simulados para demo)
  const [datosTarjeta, setDatosTarjeta] = useState({
    numero: "4242424242424242",
    expiracion: "12/25",
    cvc: "123",
    nombre: factura.clienteNombre || "",
  })

  useEffect(() => {
    if (configuracionStripe?.publishableKey) {
      loadStripe(configuracionStripe.publishableKey).then(setStripe)
    }
  }, [configuracionStripe])

  useEffect(() => {
    // Crear Payment Intent cuando se monta el componente
    crearPaymentIntent()
  }, [factura])

  const crearPaymentIntent = async () => {
    try {
      // En una implementación real, esto sería una llamada a tu backend
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(factura.total * 100), // Stripe usa centavos
          currency: "eur",
          metadata: {
            facturaId: factura.id,
            numeroFactura: factura.numeroFactura,
            clienteEmail: factura.clienteEmail,
          },
        }),
      })

      if (response.ok) {
        const { client_secret } = await response.json()
        setClientSecret(client_secret)
      } else {
        // Para demo, simulamos un client_secret
        setClientSecret(`pi_demo_${Date.now()}_secret_demo`)
      }
    } catch (error) {
      console.error("Error creando payment intent:", error)
      setError("Error inicializando el pago")
    }
  }

  const procesarPago = async () => {
    if (!stripe || !clientSecret) {
      setError("Stripe no está inicializado correctamente")
      return
    }

    setProcesando(true)
    setError(null)

    try {
      // Simular procesamiento de pago para demo
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // En una implementación real, usarías:
      // const result = await stripe.confirmCardPayment(clientSecret, {
      //   payment_method: {
      //     card: elements.getElement(CardElement),
      //     billing_details: {
      //       name: datosTarjeta.nombre,
      //       email: factura.clienteEmail,
      //     },
      //   }
      // })

      // Simular respuesta exitosa
      const result = {
        paymentIntent: {
          id: `pi_demo_${Date.now()}`,
          status: "succeeded",
          amount: factura.total * 100,
          currency: "eur",
        },
      }

      if (result.paymentIntent.status === "succeeded") {
        setExito(true)
        onPagoExitoso({
          transaccionId: result.paymentIntent.id,
          monto: result.paymentIntent.amount / 100,
          moneda: result.paymentIntent.currency,
          fechaPago: new Date().toISOString(),
        })
      } else {
        throw new Error("El pago no se completó correctamente")
      }
    } catch (error) {
      console.error("Error procesando pago:", error)
      setError(error.message || "Error procesando el pago")
      onPagoError(error)
    } finally {
      setProcesando(false)
    }
  }

  if (exito) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-700">¡Pago Exitoso!</h3>
              <p className="text-sm text-gray-600">
                El pago de €{factura.total.toFixed(2)} ha sido procesado correctamente
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800">Factura {factura.numeroFactura} pagada</Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Pagar con Tarjeta
        </CardTitle>
        <div className="text-sm text-gray-600">Factura: {factura.numeroFactura}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total a pagar:</span>
            <span className="text-xl font-bold text-blue-600">€{factura.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="numero">Número de Tarjeta</Label>
            <Input
              id="numero"
              value={datosTarjeta.numero}
              onChange={(e) => setDatosTarjeta((prev) => ({ ...prev, numero: e.target.value }))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="expiracion">Expiración</Label>
              <Input
                id="expiracion"
                value={datosTarjeta.expiracion}
                onChange={(e) => setDatosTarjeta((prev) => ({ ...prev, expiracion: e.target.value }))}
                placeholder="MM/AA"
                maxLength={5}
              />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                value={datosTarjeta.cvc}
                onChange={(e) => setDatosTarjeta((prev) => ({ ...prev, cvc: e.target.value }))}
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="nombre">Nombre en la Tarjeta</Label>
            <Input
              id="nombre"
              value={datosTarjeta.nombre}
              onChange={(e) => setDatosTarjeta((prev) => ({ ...prev, nombre: e.target.value }))}
              placeholder="Juan Pérez"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        <Button onClick={procesarPago} disabled={procesando || !stripe} className="w-full">
          {procesando ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Pagar €{factura.total.toFixed(2)}
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          <Lock className="w-3 h-3 inline mr-1" />
          Pago seguro procesado por Stripe
        </div>
      </CardContent>
    </Card>
  )
}
