import React from "react";

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="group relative w-full max-w-xs bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 m-2 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/90">
      {/* Badge Status */}
      <div className="absolute top-4 right-4">
        <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>

      {/* Image Container */}
      <div className="relative w-full h-48 mb-4 overflow-hidden rounded-xl">
        <img
          src={product.image || "https://via.placeholder.com/150"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Product Info */}
      <div className="w-full space-y-3">
        <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
          Rp {product.price.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.description || 'No description available'}
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onAddToCart(product._id)}
        disabled={product.stock <= 0}
        className={`mt-4 w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform
          ${product.stock > 0 
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg hover:-translate-y-1' 
            : 'bg-gray-400 cursor-not-allowed'}`}
      >
        {product.stock > 0 ? '+ Tambah ke Keranjang' : 'Stok Habis'}
      </button>
    </div>
  );
};

export default ProductCard;
