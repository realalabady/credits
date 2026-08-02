import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronDown, Grid, List } from "lucide-react";
import ProductCard from "../../components/ProductCard/ProductCard";
import { useStore } from "../../store/useStore";
import "./Products.css";

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { products, searchQuery } = useStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  const featuredParam = searchParams.get("featured");
  const searchParam = searchParams.get("search");

  let filteredProducts = [...products];

  if (featuredParam === "true") {
    filteredProducts = filteredProducts.filter((p) => p.featured);
  }

  if (inStockOnly) {
    filteredProducts = filteredProducts.filter((p) => p.stock > 0);
  }

  if (onSaleOnly) {
    filteredProducts = filteredProducts.filter(
      (p) => typeof p.oldPrice === "number" && p.oldPrice > p.price,
    );
  }

  const activeSearch = searchParam || searchQuery;
  if (activeSearch) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.includes(activeSearch) ||
        p.nameEn.toLowerCase().includes(activeSearch.toLowerCase()) ||
        p.description.includes(activeSearch),
    );
  }

  switch (sortBy) {
    case "price-low":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "name":
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name, "ar"));
      break;
    case "newest":
    default:
      filteredProducts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  const getPageTitle = () => {
    if (featuredParam === "true") return "عروض اليوم";
    if (activeSearch) return `نتائج البحث: ${activeSearch}`;
    return "جميع المنتجات";
  };

  const filtersActive = inStockOnly || onSaleOnly;

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>{getPageTitle()}</h1>
          <p>{filteredProducts.length} منتج</p>
        </div>

        {/* Toolbar */}
        <div className="products-toolbar">
          <div className="filter-chips">
            <button
              type="button"
              className={`filter-chip ${inStockOnly ? "active" : ""}`}
              aria-pressed={inStockOnly}
              onClick={() => setInStockOnly((v) => !v)}
            >
              المتوفر فقط
            </button>
            <button
              type="button"
              className={`filter-chip ${onSaleOnly ? "active" : ""}`}
              aria-pressed={onSaleOnly}
              onClick={() => setOnSaleOnly((v) => !v)}
            >
              عليه خصم
            </button>
            {filtersActive && (
              <button
                type="button"
                className="filter-reset"
                onClick={() => {
                  setInStockOnly(false);
                  setOnSaleOnly(false);
                }}
              >
                إعادة تعيين
              </button>
            )}
          </div>

          <div className="toolbar-right">
            <div className="sort-select">
              <select
                value={sortBy}
                aria-label="ترتيب المنتجات"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">الأحدث</option>
                <option value="price-low">السعر: من الأقل للأعلى</option>
                <option value="price-high">السعر: من الأعلى للأقل</option>
                <option value="name">الاسم</option>
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </div>

            <div className="view-modes">
              <button
                className={viewMode === "grid" ? "active" : ""}
                aria-label="عرض شبكي"
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
              >
                <Grid size={18} aria-hidden="true" />
              </button>
              <button
                className={viewMode === "list" ? "active" : ""}
                aria-label="عرض قائمة"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
              >
                <List size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className={`products-grid ${viewMode}`}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-products">
            <p>لا توجد منتجات مطابقة</p>
            {filtersActive ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setInStockOnly(false);
                  setOnSaleOnly(false);
                }}
              >
                إزالة الفلاتر
              </button>
            ) : (
              <Link to="/products" className="btn btn-primary">
                تصفح المنتجات
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
