import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 10,
  },
  logo: {
    width: 150,
    height: 50,
    objectFit: 'contain',
  },
  companyInfo: {
    fontSize: 10,
    textAlign: 'right',
    color: '#666666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a365d', // Azul oscuro similar al tema
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: '#666666',
    width: 100,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 20,
    marginBottom: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f3f4f6',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    margin: 'auto',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 'auto',
    fontSize: 10,
  },
  totalSection: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
    width: '100%',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 20,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#999999',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 10,
  },
});

// Componente Documento PDF
const DocumentoCotizacion = ({ cotizacion, tienda }) => {
  if (!cotizacion) return null;

  const fechaCreacion = cotizacion.fechaCreacion?.seconds 
    ? new Date(cotizacion.fechaCreacion.seconds * 1000).toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header con Logo e Info Empresa */}
        <View style={styles.header}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2563eb' }}>
              {tienda?.nombre || 'Track My Sign'}
            </Text>
            {/* Si tuviéramos logo URL, usaríamos <Image src={tienda.logo} style={styles.logo} /> */}
          </View>
          <View style={styles.companyInfo}>
            <Text>{tienda?.direccion || 'Dirección de la Tienda'}</Text>
            <Text>{tienda?.telefono || 'Teléfono: 123-456-7890'}</Text>
            <Text>{tienda?.email || 'contacto@tienda.com'}</Text>
          </View>
        </View>

        {/* Título y Datos Básicos */}
        <Text style={styles.title}>Cotización #{cotizacion.numero || '---'}</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Cliente:</Text>
            <Text style={styles.value}>{cotizacion.cliente?.nombre || 'Cliente General'}</Text>
            <Text style={{ fontSize: 10, color: '#666' }}>{cotizacion.cliente?.email}</Text>
            <Text style={{ fontSize: 10, color: '#666' }}>{cotizacion.cliente?.telefono}</Text>
          </View>
          <View>
            <View style={styles.row}>
              <Text style={styles.label}>Fecha:</Text>
              <Text style={styles.value}>{fechaCreacion}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Válido hasta:</Text>
              <Text style={styles.value}>
                {/* Asumimos 30 días de validez por defecto si no hay fecha */}
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabla de Items (Si existieran items detallados, aquí simulamos una estructura genérica o usamos la descripción) */}
        {/* Como el modelo de datos puede variar, mostraremos la descripción principal y un desglose si existe */}
        
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableColHeader, width: '50%' }}>
              <Text style={styles.tableCellHeader}>Descripción</Text>
            </View>
            <View style={{ ...styles.tableColHeader, width: '15%' }}>
              <Text style={styles.tableCellHeader}>Cant.</Text>
            </View>
            <View style={{ ...styles.tableColHeader, width: '15%' }}>
              <Text style={styles.tableCellHeader}>Precio U.</Text>
            </View>
            <View style={{ ...styles.tableColHeader, width: '20%' }}>
              <Text style={styles.tableCellHeader}>Total</Text>
            </View>
          </View>

          {/* Fila Principal basada en la cotización */}
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '50%' }}>
              <Text style={styles.tableCell}>{cotizacion.titulo || 'Servicio de Rotulación'}</Text>
              <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>
                {cotizacion.descripcion || 'Detalles del servicio solicitado.'}
              </Text>
            </View>
            <View style={{ ...styles.tableCol, width: '15%' }}>
              <Text style={styles.tableCell}>1</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '15%' }}>
              <Text style={styles.tableCell}>€{cotizacion.totales?.subtotal || cotizacion.totales?.total || 0}</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '20%' }}>
              <Text style={styles.tableCell}>€{cotizacion.totales?.subtotal || cotizacion.totales?.total || 0}</Text>
            </View>
          </View>
        </View>

        {/* Totales */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.value}>€{cotizacion.totales?.subtotal || cotizacion.totales?.total || 0}</Text>
          </View>
          {cotizacion.totales?.impuestos > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA ({((cotizacion.totales.impuestos / cotizacion.totales.subtotal) * 100).toFixed(0)}%):</Text>
              <Text style={styles.value}>€{cotizacion.totales.impuestos}</Text>
            </View>
          )}
          <View style={{ ...styles.totalRow, marginTop: 5 }}>
            <Text style={{ ...styles.totalLabel, fontSize: 14 }}>TOTAL:</Text>
            <Text style={{ ...styles.totalValue, fontSize: 14 }}>€{cotizacion.totales?.total || 0}</Text>
          </View>
        </View>

        {/* Notas y Condiciones */}
        <View style={{ marginTop: 40 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>Notas:</Text>
          <Text style={{ fontSize: 9, color: '#666', lineHeight: 1.5 }}>
            Esta cotización es válida por 30 días. Para aprobar este presupuesto, favor de firmar y enviar copia o aprobar directamente en nuestro portal.
            Los tiempos de entrega comenzarán a contar a partir de la recepción del anticipo (si aplica) y archivos finales aprobados.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Gracias por su preferencia - {tienda?.nombre || 'Track My Sign'} - Generado digitalmente
        </Text>
      </Page>
    </Document>
  );
};

export default DocumentoCotizacion;
