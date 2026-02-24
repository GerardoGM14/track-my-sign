import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Estilos para el PDF (reutilizados y adaptados)
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
  companyInfo: {
    fontSize: 10,
    textAlign: 'right',
    color: '#666666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a365d',
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
  statusBadge: {
    padding: 4,
    backgroundColor: '#e5e7eb',
    fontSize: 10,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 5,
  }
});

// Componente Documento PDF para Órdenes
const DocumentoOrden = ({ orden, tienda }) => {
  if (!orden) return null;

  const fechaCreacion = orden.fechaCreacion?.seconds 
    ? new Date(orden.fechaCreacion.seconds * 1000).toLocaleDateString()
    : new Date().toLocaleDateString();
    
  const fechaEntrega = orden.fechaEntrega?.seconds
    ? new Date(orden.fechaEntrega.seconds * 1000).toLocaleDateString()
    : 'Pendiente';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header con Logo e Info Empresa */}
        <View style={styles.header}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2563eb' }}>
              {tienda?.nombre || 'Track My Sign'}
            </Text>
          </View>
          <View style={styles.companyInfo}>
            <Text>{tienda?.direccion || 'Dirección de la Tienda'}</Text>
            <Text>{tienda?.telefono || 'Teléfono: 123-456-7890'}</Text>
            <Text>{tienda?.email || 'contacto@tienda.com'}</Text>
          </View>
        </View>

        {/* Título y Datos Básicos */}
        <Text style={styles.title}>Orden de Trabajo #{orden.numero || '---'}</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Cliente:</Text>
            <Text style={styles.value}>{orden.cliente?.nombre || 'Cliente General'}</Text>
            <Text style={{ fontSize: 10, color: '#666' }}>{orden.cliente?.email}</Text>
            <Text style={{ fontSize: 10, color: '#666' }}>{orden.cliente?.telefono}</Text>
          </View>
          <View>
            <View style={styles.row}>
              <Text style={styles.label}>Fecha Creación:</Text>
              <Text style={styles.value}>{fechaCreacion}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Fecha Entrega:</Text>
              <Text style={styles.value}>{fechaEntrega}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Estado:</Text>
              <Text style={styles.value}>{orden.estado?.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Tabla de Items */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableColHeader, width: '50%' }}>
              <Text style={styles.tableCellHeader}>Descripción / Producto</Text>
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

          {/* Items de la orden */}
          {orden.items && orden.items.length > 0 ? (
            orden.items.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={{ ...styles.tableCol, width: '50%' }}>
                  <Text style={styles.tableCell}>{item.nombreProducto || item.descripcion || 'Item sin nombre'}</Text>
                  {item.detalles && (
                    <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>
                      {item.detalles}
                    </Text>
                  )}
                </View>
                <View style={{ ...styles.tableCol, width: '15%' }}>
                  <Text style={styles.tableCell}>{item.cantidad || 1}</Text>
                </View>
                <View style={{ ...styles.tableCol, width: '15%' }}>
                  <Text style={styles.tableCell}>€{item.precioUnitario || 0}</Text>
                </View>
                <View style={{ ...styles.tableCol, width: '20%' }}>
                  <Text style={styles.tableCell}>€{(item.cantidad || 1) * (item.precioUnitario || 0)}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '50%' }}>
                <Text style={styles.tableCell}>{orden.titulo || 'Servicio General'}</Text>
                <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>
                  {orden.descripcion || 'Sin descripción detallada'}
                </Text>
              </View>
              <View style={{ ...styles.tableCol, width: '15%' }}>
                <Text style={styles.tableCell}>1</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '15%' }}>
                <Text style={styles.tableCell}>€{orden.monto || orden.total || 0}</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '20%' }}>
                <Text style={styles.tableCell}>€{orden.monto || orden.total || 0}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Totales */}
        <View style={styles.totalSection}>
          <View style={{ ...styles.totalRow, marginTop: 5 }}>
            <Text style={{ ...styles.totalLabel, fontSize: 14 }}>TOTAL:</Text>
            <Text style={{ ...styles.totalValue, fontSize: 14 }}>€{orden.monto || orden.total || 0}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generado automáticamente por Track My Sign - {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  );
};

export default DocumentoOrden;
