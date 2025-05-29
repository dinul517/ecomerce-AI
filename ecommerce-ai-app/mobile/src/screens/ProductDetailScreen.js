import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../config/api';

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const addToCart = async () => {
    setLoading(true);
    try {
      await api.post('/cart/items', {
        productId: product._id,
        quantity: quantity,
      });
      Alert.alert(
        'Berhasil',
        'Produk berhasil ditambahkan ke keranjang',
        [
          {
            text: 'Lanjut Belanja',
            style: 'cancel',
          },
          {
            text: 'Lihat Keranjang',
            onPress: () => navigation.navigate('Cart'),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Gagal menambahkan produk ke keranjang');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              Rp {product.price.toLocaleString()}
            </Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={20} color="#FFD700" />
              <Text style={styles.rating}>{product.rating || '4.5'}</Text>
            </View>
          </View>

          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Kategori:</Text>
            <Text style={styles.category}>{product.category}</Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Deskripsi:</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Jumlah:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.quantityButton}
              >
                <Icon name="remove" size={20} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={styles.quantityButton}
              >
                <Icon name="add" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={addToCart}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="shopping-cart" size={24} color="#fff" />
              <Text style={styles.addToCartText}>Tambah ke Keranjang</Text>
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
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 300,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  price: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 5,
    fontSize: 16,
    color: '#666',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  category: {
    fontSize: 16,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 5,
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 15,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProductDetailScreen; 