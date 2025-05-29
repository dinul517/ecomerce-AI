import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../config/api';

const AddAddressScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    isDefault: false,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const { name, phone, street, city, province, postalCode } = formData;
    if (!name || !phone || !street || !city || !province || !postalCode) {
      Alert.alert('Error', 'Semua field harus diisi');
      return false;
    }
    if (phone.length < 10) {
      Alert.alert('Error', 'Nomor telepon tidak valid');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.post('/users/addresses', formData);
      Alert.alert(
        'Berhasil',
        'Alamat berhasil ditambahkan',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding address:', error);
      Alert.alert('Error', 'Gagal menambahkan alamat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Penerima</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama penerima"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nomor Telepon</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nomor telepon"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alamat Lengkap</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Masukkan alamat lengkap"
              multiline
              numberOfLines={3}
              value={formData.street}
              onChangeText={(value) => handleInputChange('street', value)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Kota</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan kota"
                value={formData.city}
                onChangeText={(value) => handleInputChange('city', value)}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Provinsi</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan provinsi"
                value={formData.province}
                onChangeText={(value) => handleInputChange('province', value)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kode Pos</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan kode pos"
              keyboardType="numeric"
              value={formData.postalCode}
              onChangeText={(value) => handleInputChange('postalCode', value)}
            />
          </View>

          <TouchableOpacity
            style={styles.defaultAddressButton}
            onPress={() => handleInputChange('isDefault', !formData.isDefault)}
          >
            <Icon
              name={formData.isDefault ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color="#007AFF"
            />
            <Text style={styles.defaultAddressText}>Jadikan alamat default</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Simpan Alamat</Text>
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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  defaultAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  defaultAddressText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddAddressScreen; 