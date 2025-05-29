const { UserInteraction, ProductSimilarity } = require('../models/recommendationModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// Track user interaction with products
const trackInteraction = async (req, res) => {
  try {
    const { productId, interactionType, context } = req.body;
    const userId = req.user._id;

    if (!productId || !interactionType) {
      return res.status(400).json({ message: 'Product ID and interaction type are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const interaction = new UserInteraction({
      user: userId,
      product: productId,
      interactionType,
      context: {
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        device: req.headers['user-agent'],
        ...context
      }
    });

    await interaction.save();
    res.status(200).json({ message: 'Interaction tracked successfully' });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({ message: 'Error tracking interaction', error: error.message });
  }
};

// Get personalized recommendations for a user
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Get user's recent interactions with context
    const recentInteractions = await UserInteraction.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate({
        path: 'product',
        select: '_id name price image category description'
      });

    let recommendedProducts = [];
    const currentHour = new Date().getHours();
    const isDaytime = currentHour >= 6 && currentHour < 18;

    // Analyze user preferences
    const userPreferences = analyzeUserPreferences(recentInteractions);
    
    if (recentInteractions.length > 0) {
      // Get products from user's interactions
      const interactedProductIds = recentInteractions.map(i => i.product._id);

      // Find similar products based on user interactions and preferences
      const similarProducts = await ProductSimilarity.find({
        product1: { $in: interactedProductIds }
      })
      .sort({ similarity: -1 })
      .limit(30)
      .populate({
        path: 'product2',
        select: '_id name price image category description'
      });

      // Get unique recommended products with preference scoring
      recommendedProducts = similarProducts
        .map(sp => ({
          product: sp.product2,
          score: calculateProductScore(sp.product2, userPreferences, isDaytime)
        }))
        .sort((a, b) => b.score - a.score)
        .map(item => item.product)
        .slice(0, 8);
    }

    // If not enough recommendations, add personalized popular products
    if (recommendedProducts.length < 8) {
      const popularProducts = await Product.find({
        _id: { $nin: recommendedProducts.map(p => p._id) },
        category: { $in: userPreferences.topCategories }
      })
      .select('_id name price image category description')
      .sort({ views: -1 })
      .limit(12 - recommendedProducts.length);

      recommendedProducts.push(...popularProducts);
    }

    // Enhance product data with AI-generated content
    recommendedProducts = recommendedProducts.map(product => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image || 'https://via.placeholder.com/300x200?text=No+Image',
      category: product.category,
      description: generatePersonalizedDescription(product, userPreferences),
      relevance: calculateRelevanceScore(product, userPreferences)
    }));

    res.status(200).json(recommendedProducts);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Error getting recommendations', error: error.message });
  }
};

// Helper function to analyze user preferences
const analyzeUserPreferences = (interactions) => {
  const preferences = {
    categories: {},
    priceRange: { min: Infinity, max: 0 },
    timePreferences: {},
    topCategories: []
  };

  interactions.forEach(interaction => {
    const product = interaction.product;
    
    // Category preferences
    preferences.categories[product.category] = (preferences.categories[product.category] || 0) + 1;
    
    // Price range
    preferences.priceRange.min = Math.min(preferences.priceRange.min, product.price);
    preferences.priceRange.max = Math.max(preferences.priceRange.max, product.price);
    
    // Time preferences
    const hour = new Date(interaction.timestamp).getHours();
    preferences.timePreferences[hour] = (preferences.timePreferences[hour] || 0) + 1;
  });

  // Get top categories
  preferences.topCategories = Object.entries(preferences.categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);

  return preferences;
};

// Helper function to calculate product score
const calculateProductScore = (product, preferences, isDaytime) => {
  let score = 0;
  
  // Category relevance
  if (preferences.topCategories.includes(product.category)) {
    score += 0.4;
  }
  
  // Price range relevance
  const priceRange = preferences.priceRange;
  if (product.price >= priceRange.min && product.price <= priceRange.max) {
    score += 0.3;
  }
  
  // Time-based relevance
  const currentHour = new Date().getHours();
  if (preferences.timePreferences[currentHour]) {
    score += 0.2;
  }
  
  // Day/night preference
  if ((isDaytime && product.category === 'Electronics') || 
      (!isDaytime && product.category === 'Books')) {
    score += 0.1;
  }
  
  return score;
};

// Helper function to generate personalized description
const generatePersonalizedDescription = (product, preferences) => {
  const baseDescription = product.description || '';
  const personalizedElements = [];
  
  if (preferences.topCategories.includes(product.category)) {
    personalizedElements.push('Berdasarkan preferensi Anda');
  }
  
  if (product.price >= preferences.priceRange.min && 
      product.price <= preferences.priceRange.max) {
    personalizedElements.push('sesuai dengan budget Anda');
  }
  
  return personalizedElements.length > 0 
    ? `${baseDescription} (${personalizedElements.join(', ')})`
    : baseDescription;
};

// Helper function to calculate relevance score
const calculateRelevanceScore = (product, preferences) => {
  const score = calculateProductScore(product, preferences, new Date().getHours() >= 6 && new Date().getHours() < 18);
  return Math.round(score * 100);
};

// Update product similarities (to be run periodically)
const updateProductSimilarities = async (req, res) => {
  try {
    const products = await Product.find();
    
    if (!products.length) {
      return res.status(404).json({ message: 'No products found to calculate similarities' });
    }

    // Calculate similarities between products
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        const similarity = calculateProductSimilarity(products[i], products[j]);
        
        await ProductSimilarity.findOneAndUpdate(
          {
            product1: products[i]._id,
            product2: products[j]._id
          },
          {
            product1: products[i]._id,
            product2: products[j]._id,
            similarity
          },
          { upsert: true }
        );
      }
    }

    res.status(200).json({ message: 'Product similarities updated successfully' });
  } catch (error) {
    console.error('Error updating similarities:', error);
    res.status(500).json({ message: 'Error updating similarities', error: error.message });
  }
};

// Helper function to calculate similarity between products
const calculateProductSimilarity = (product1, product2) => {
  try {
    let similarity = 0;
    
    // Category similarity (0.4)
    if (product1.category === product2.category) {
      similarity += 0.4;
    }
    
    // Price range similarity (0.3)
    const priceDiff = Math.abs(product1.price - product2.price);
    const maxPrice = Math.max(product1.price, product2.price);
    similarity += 0.3 * (1 - priceDiff / maxPrice);
    
    // Description similarity (0.3)
    if (product1.description && product2.description) {
      const words1 = new Set(product1.description.toLowerCase().split(/\W+/));
      const words2 = new Set(product2.description.toLowerCase().split(/\W+/));
      const intersection = new Set([...words1].filter(x => words2.has(x)));
      const union = new Set([...words1, ...words2]);
      similarity += 0.3 * (intersection.size / union.size);
    }
    
    return similarity;
  } catch (error) {
    console.error('Error calculating similarity:', error);
    return 0;
  }
};

module.exports = {
  trackInteraction,
  getRecommendations,
  updateProductSimilarities
};
