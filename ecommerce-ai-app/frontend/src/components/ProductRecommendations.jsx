import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProductRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});

  // Default image jika gambar tidak tersedia
  const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const trackProductInteraction = async (productId, interactionType) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${apiUrl}/api/recommendations/track`,
        { productId, interactionType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error tracking interaction:', err);
    }
  };

  const handleImageLoad = (productId) => {
    setLoadedImages(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  const handleImageError = (e, productId) => {
    e.target.onerror = null;
    e.target.src = defaultImage;
    handleImageLoad(productId);
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to see recommendations');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${apiUrl}/api/recommendations/recommendations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Validasi dan normalisasi data gambar
        const validatedData = response.data.map(product => ({
          ...product,
          image: product.image && product.image.startsWith('http') ? product.image : defaultImage
        }));

        setRecommendations(validatedData);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Gagal mengambil rekomendasi produk');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">{error}</div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Rekomendasi untuk Anda</h2>
        <p className="text-gray-500 text-center">Belum ada rekomendasi produk</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Rekomendasi untuk Anda</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <Link 
            key={product._id} 
            to={`/product/${product._id}`}
            className="group"
            onClick={() => trackProductInteraction(product._id, 'view')}
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <div className="relative w-full h-48 bg-gray-100">
                {!loadedImages[product._id] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                <img 
                  src={product.image}
                  alt={product.name}
                  className={`w-full h-48 object-cover transition-opacity duration-300 ${
                    loadedImages[product._id] ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => handleImageLoad(product._id)}
                  onError={(e) => handleImageError(e, product._id)}
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                <p className="text-lg font-semibold text-blue-600 mt-2">
                  Rp {product.price?.toLocaleString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations; 