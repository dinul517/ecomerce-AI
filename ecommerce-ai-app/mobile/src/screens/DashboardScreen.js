import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import api from '../config/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;

const DashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    recentOrders: [],
    cartItems: 0,
    totalSpent: 0,
    wishlistItems: 0,
    recommendedProducts: [],
    notifications: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersResponse, cartResponse, wishlistResponse, productsResponse, notificationsResponse] = await Promise.all([
        api.get('/orders?limit=3'),
        api.get('/cart'),
        api.get('/wishlist'),
        api.get('/products/recommended'),
        api.get('/notifications'),
      ]);

      setDashboardData({
        recentOrders: ordersResponse.data,
        cartItems: cartResponse.data.items.length,
        totalSpent: ordersResponse.data.reduce((sum, order) => sum + order.total, 0),
        wishlistItems: wishlistResponse.data.length,
        recommendedProducts: productsResponse.data,
        notifications: notificationsResponse.data,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const renderSummaryCard = (icon, title, value, color) => (
    <LinearGradient
      colors={[`${color}15`, `${color}05`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.summaryCard}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.summaryContent}>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      </View>
    </LinearGradient>
  );

  const renderQuickAction = (icon, title, onPress, color) => (
    <TouchableOpacity 
      style={styles.quickAction} 
      onPress={onPress}
    >
      <LinearGradient
        colors={[`${color}15`, `${color}05`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.quickActionGradient}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
          <Icon name={icon} size={24} color="#fff" />
        </View>
        <Text style={[styles.quickActionText, { color }]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderProductCard = (product) => (
    <TouchableOpacity
      key={product._id}
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product })}
    >
      <Image
        source={{ uri: product.images[0] }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productPrice}>
          Rp {product.price.toLocaleString()}
        </Text>
        <View style={styles.productRating}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{product.rating || '4.5'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNotification = (notification) => (
    <TouchableOpacity
      key={notification._id}
      style={styles.notificationCard}
      onPress={() => {
        if (notification.type === 'order') {
          navigation.navigate('OrderDetail', { orderId: notification.orderId });
        }
      }}
    >
      <View style={[styles.notificationIcon, { backgroundColor: notification.read ? '#E5E5EA' : '#007AFF' }]}>
        <Icon name={notification.icon || 'notifications'} size={20} color="#fff" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.notificationTime}>
          {new Date(notification.createdAt).toLocaleDateString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2563EB', '#1E40AF']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Selamat Datang,</Text>
            <Text style={styles.userName}>User</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="person" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.scrollView}
      >
        <View style={styles.summaryContainer}>
          {renderSummaryCard(
            'shopping-cart',
            'Keranjang',
            `${dashboardData.cartItems} item`,
            '#2563EB'
          )}
          {renderSummaryCard(
            'favorite',
            'Wishlist',
            `${dashboardData.wishlistItems} item`,
            '#DC2626'
          )}
          {renderSummaryCard(
            'account-balance-wallet',
            'Total Belanja',
            `Rp ${dashboardData.totalSpent.toLocaleString()}`,
            '#059669'
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aksi Cepat</Text>
          </View>
          <View style={styles.quickActions}>
            {renderQuickAction(
              'chat',
              'Chat AI',
              () => navigation.navigate('Chat'),
              '#2563EB'
            )}
            {renderQuickAction(
              'local-shipping',
              'Pesanan',
              () => navigation.navigate('Orders'),
              '#059669'
            )}
            {renderQuickAction(
              'favorite',
              'Wishlist',
              () => navigation.navigate('Wishlist'),
              '#DC2626'
            )}
            {renderQuickAction(
              'settings',
              'Pengaturan',
              () => navigation.navigate('Settings'),
              '#7C3AED'
            )}
          </View>
        </View>

        {dashboardData.notifications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Notifikasi</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}
              >
                <Text style={styles.seeAllText}>Lihat Semua</Text>
              </TouchableOpacity>
            </View>
            {dashboardData.notifications.slice(0, 3).map(renderNotification)}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rekomendasi untuk Anda</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Products')}
            >
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsContainer}
          >
            {dashboardData.recommendedProducts.map(renderProductCard)}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pesanan Terakhir</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Orders')}
            >
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          {dashboardData.recentOrders.map((order) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order._id })}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{order._id.slice(-6)}</Text>
                <Text style={[
                  styles.orderStatus,
                  { color: order.status === 'delivered' ? '#059669' : '#F59E0B' }
                ]}>
                  {order.status === 'delivered' ? 'Selesai' : 'Diproses'}
                </Text>
              </View>
              <View style={styles.orderDetails}>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('id-ID')}
                </Text>
                <Text style={styles.orderTotal}>
                  Rp {order.total.toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#E5E7EB',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  summaryContainer: {
    padding: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAllText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 15,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: CARD_WIDTH,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  productsContainer: {
    paddingRight: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default DashboardScreen; 