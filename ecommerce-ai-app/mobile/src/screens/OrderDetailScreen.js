import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../config/api';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert('Error', 'Gagal memuat detail pesanan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'processing':
        return '#007AFF';
      case 'shipped':
        return '#4CAF50';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'processing':
        return 'Diproses';
      case 'shipped':
        return 'Dikirim';
      case 'delivered':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Pesanan tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Pesanan</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(order.status) },
              ]}
            />
            <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Pengiriman</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressName}>{order.address.name}</Text>
            <Text style={styles.addressPhone}>{order.address.phone}</Text>
            <Text style={styles.addressText}>{order.address.street}</Text>
            <Text style={styles.addressText}>
              {order.address.city}, {order.address.province} {order.address.postalCode}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produk</Text>
          {order.items.map((item) => (
            <View key={item._id} style={styles.productItem}>
              <Image
                source={{ uri: item.product.images[0] }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.product.name}</Text>
                <Text style={styles.productPrice}>
                  Rp {item.product.price.toLocaleString()}
                </Text>
                <Text style={styles.productQuantity}>
                  Jumlah: {item.quantity}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              Rp {order.subtotal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pengiriman</Text>
            <Text style={styles.summaryValue}>
              Rp {order.shippingCost.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.summaryItem, styles.totalItem]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              Rp {order.total.toLocaleString()}
            </Text>
          </View>
        </View>

        {order.status === 'pending' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pembayaran</Text>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentMethod}>
                Metode: {order.paymentMethod === 'transfer' ? 'Transfer Bank' : 'E-Wallet'}
              </Text>
              <Text style={styles.paymentInstructions}>
                Silakan lakukan pembayaran sesuai dengan instruksi yang dikirimkan
                melalui email atau WhatsApp.
              </Text>
            </View>
          </View>
        )}

        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catatan</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}
      </ScrollView>

      {order.status === 'pending' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              Alert.alert(
                'Batalkan Pesanan',
                'Apakah Anda yakin ingin membatalkan pesanan ini?',
                [
                  {
                    text: 'Tidak',
                    style: 'cancel',
                  },
                  {
                    text: 'Ya',
                    onPress: async () => {
                      try {
                        await api.put(`/orders/${orderId}/cancel`);
                        fetchOrderDetails();
                      } catch (error) {
                        console.error('Error cancelling order:', error);
                        Alert.alert('Error', 'Gagal membatalkan pesanan');
                      }
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.cancelButtonText}>Batalkan Pesanan</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
  },
  totalItem: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  paymentInfo: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paymentInstructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderDetailScreen; 