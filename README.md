# 🖥️ SaaS para Imprentas y Rotulación  
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/) 
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38b2ac?logo=tailwindcss)](https://tailwindcss.com/) 
[![Firebase](https://img.shields.io/badge/Firebase-Backend-orange?logo=firebase)](https://firebase.google.com/) 
[![Stripe](https://img.shields.io/badge/Stripe-Payments-626cd9?logo=stripe)](https://stripe.com/)  

✨ Proyecto **multitenant SaaS** para imprentas y talleres de rotulación. Hecho con **React, TailwindCSS y Firebase**, con **Stripe** para pagos en línea.  

---

## 📖 Descripción
Este sistema permite que cada taller tenga su propio espacio privado para gestionar:  
- Cotizaciones ➝ Pedidos ➝ Producción ➝ Facturación ➝ Pagos.  
- Flujos de trabajo con tablero Kanban.  
- Enlaces públicos para clientes (cotizaciones, pruebas, facturas).  
- Reportes básicos de ventas y pendientes.  

Es una solución **todo en uno** para optimizar la gestión en el día a día de las imprentas y rotulaciones:contentReference[oaicite:0]{index=0}.  

---

## 🚀 Características principales
✅ **Gestión de cotizaciones**: precios por medidas, materiales y opciones.  
✅ **Pedidos y producción**: flujo Kanban para seguir el estado de cada trabajo.  
✅ **Pruebas gráficas online**: subida de archivos, comentarios y aprobación de clientes.  
✅ **Facturación**: generación de facturas personalizadas con logo de la empresa.  
✅ **Pagos en línea con Stripe**: seguros y automatizados.  
✅ **Reportes básicos**: ventas mensuales, facturas vencidas, tasa de conversión.  
✅ **Multitenant**: cada cliente tiene su propio espacio aislado.  
✅ **UI responsive y moderna**: gracias a React + TailwindCSS.  

---

## 🛠️ Tecnologías usadas
- ⚛️ **Frontend**: [React 18](https://react.dev/)  
- 🎨 **Estilos**: [TailwindCSS 4.0](https://tailwindcss.com/)  
- 🔥 **Backend/Hosting**: [Firebase](https://firebase.google.com/)  
- 💳 **Pagos**: [Stripe Checkout](https://stripe.com/)  
- 📦 **DevOps sugerido**: Docker, métricas y backups (en roadmap).  

---

## 📂 Arquitectura general
```mermaid
graph TD;
    subgraph Cliente
        React[Tienda React + TailwindCSS]-->FirebaseAuth[Firebase Auth];
        React-->Firestore[Firestore DB];
        React-->Storage[Firebase Storage];
    end
    subgraph Backend
        FirebaseAuth-->Stripe[Stripe API];
        Firestore-->Stripe;
    end
    Stripe-->Pagos[(Pagos Online)];

## ⚙️ Instalación y ejecución
Clonar el repositorio
