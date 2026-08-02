import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import type { Product } from "../../types";
import { useStore } from "../../store/useStore";
import { PRODUCT_PLACEHOLDER } from "../../constants/media";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const wishlisted = isInWishlist(product.id);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(price);
  };

  return (
    <div className="product-card fade-in">
      {/* Badges */}
      <div className="product-badges">
        {discount > 0 && <span className="badge-discount">-{discount}%</span>}
        {product.featured && <span className="badge-featured">مميز</span>}
        {product.stock === 0 && (
          <span className="badge-soldout">نفذت الكمية</span>
        )}
      </div>

      {/* Image */}
      <Link to={`/product/${product.id}`} className="product-image">
        <img
          src={product.images[0] || PRODUCT_PLACEHOLDER}
          alt={product.name}
          loading="lazy"
          width="300"
          height="300"
        />
      </Link>

      {/* Quick Actions */}
      <div className="product-actions">
        <button
          className={`action-icon ${wishlisted ? "wishlisted" : ""}`}
          aria-label={wishlisted ? "إزالة من المفضلة" : "أضف للمفضلة"}
          aria-pressed={wishlisted}
          onClick={() => toggleWishlist(product.id)}
        >
          <Heart
            size={18}
            aria-hidden="true"
            fill={wishlisted ? "#ef4444" : "none"}
            color={wishlisted ? "#ef4444" : "currentColor"}
          />
        </button>
        <Link
          to={`/product/${product.id}`}
          className="action-icon"
          aria-label="عرض المنتج"
        >
          <Eye size={18} aria-hidden="true" />
        </Link>
      </div>

      {/* Content */}
      <div className="product-content">
        {product.brand && (
          <span className="product-brand">{product.brand}</span>
        )}

        <Link to={`/product/${product.id}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>

        {/* Rating — only when the product actually carries one */}
        {typeof product.rating === "number" && product.rating > 0 && (
          <div className="product-rating">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                aria-hidden="true"
                fill={i < Math.round(product.rating!) ? "#c08a2e" : "none"}
                color="#c08a2e"
              />
            ))}
            {product.reviewCount ? <span>({product.reviewCount})</span> : null}
          </div>
        )}

        {/* Price */}
        <div className="product-pricing">
          <span className="current-price price">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="old-price price">{formatPrice(product.oldPrice)}</span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          className="add-to-cart-btn"
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
        >
          <ShoppingCart size={18} aria-hidden="true" />
          <span>أضف للسلة</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
