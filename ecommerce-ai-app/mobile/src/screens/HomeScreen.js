import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Selamat Datang</Text>
          <Text style={styles.headerSubtitle}>Temukan produk terbaik untuk Anda</Text>
        </View>

        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Produk Unggulan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Featured products will be mapped here */}
          </ScrollView>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Kategori</Text>
          <View style={styles.categoriesGrid}>
            {/* Categories will be mapped here */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  featuredSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoriesSection: {
    padding: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default HomeScreen; 