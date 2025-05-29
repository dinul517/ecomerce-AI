import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../config/api';

const CheckoutScreen = ({ route, navigation }) => {
  const { total } = route.params;
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      setAddresses(response.data);
      if (response.data.length > 0) {
        setSelectedAddress(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Silakan pilih alamat pengiriman');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        addressId: selectedAddress._id,
        paymentMethod,
        notes,
      };

      const response = await api.post('/orders', orderData);
      
      Alert.alert(
        'Berhasil',
        'Pesanan Anda telah berhasil dibuat',
        [
          {
            text: 'Lihat Pesanan',
            onPress: () => navigation.navigate('OrderDetail', { orderId: response.data._id }),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const renderAddressItem = (address) => (
    <TouchableOpacity
      key={address._id}
      style={[
        styles.addressItem,
        selectedAddress?._id === address._id && styles.selectedAddress,
      ]}
      onPress={() => setSelectedAddress(address)}
    >
      <View style={styles.addressContent}>
        <Text style={styles.addressName}>{address.name}</Text>
        <Text style={styles.addressPhone}>{address.phone}</Text>
        <Text style={styles.addressText}>{address.street}</Text>
        <Text style={styles.addressText}>
          {address.city}, {address.province} {address.postalCode}
        </Text>
      </View>
      <Icon
        name={selectedAddress?._id === address._id ? 'radio-button-checked' : 'radio-button-unchecked'}
        size={24}
        color="#007AFF"
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alamat Pengiriman</Text>
          {addresses.map(renderAddressItem)}
          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={() => navigation.navigate('AddAddress')}
          >
            <Icon name="add" size={24} color="#007AFF" />
            <Text style={styles.addAddressText}>Tambah Alamat Baru</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              paymentMethod === 'transfer' && styles.selectedPayment,
            ]}
            onPress={() => setPaymentMethod('transfer')}
          >
            <Icon name="account-balance" size={24} color="#007AFF" />
            <Text style={styles.paymentText}>Transfer Bank</Text>
            <Icon
              name={paymentMethod === 'transfer' ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              paymentMethod === 'ewallet' && styles.selectedPayment,
            ]}
            onPress={() => setPaymentMethod('ewallet')}
          >
            <Icon name="account-balance-wallet" size={24} color="#007AFF" />
            <Text style={styles.paymentText}>E-Wallet</Text>
            <Icon
              name={paymentMethod === 'ewallet' ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catatan</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Tambahkan catatan untuk pesanan Anda"
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan Pesanan</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rp {total.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pengiriman</Text>
            <Text style={styles.summaryValue}>Rp 20.000</Text>
          </View>
          <View style={[styles.summaryItem, styles.totalItem]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              Rp {(total + 20000).toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.checkoutButtonText}>Buat Pesanan</Text>
              <Text style={styles.checkoutButtonSubtext}>
                Rp {(total + 20000).toLocaleString()}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedAddress: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  addressContent: {
    flex: 1,
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
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 10,
    marginTop: 10,
  },
  addAddressText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 10,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedPayment: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  paymentText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
  notesInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    height: 100,
    textAlignVertical: 'top',
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
});

export default CheckoutScreen; 