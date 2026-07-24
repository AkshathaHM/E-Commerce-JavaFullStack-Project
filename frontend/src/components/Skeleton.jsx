import React, { memo } from 'react';

const SkeletonBlock = ({ className = '', style = {} }) => (
  <div className={`skeleton-block ${className}`.trim()} style={style} />
);

export const ProductCardSkeleton = memo(() => (
  <div className="product-card skeleton-card">
    <SkeletonBlock className="skeleton-image" />
    <div className="skeleton-stack">
      <SkeletonBlock className="skeleton-line short" />
      <SkeletonBlock className="skeleton-line" />
      <SkeletonBlock className="skeleton-line tiny" />
      <SkeletonBlock className="skeleton-button" />
    </div>
  </div>
));

export const CartItemSkeleton = memo(() => (
  <div className="cart-skeleton-item">
    <SkeletonBlock className="skeleton-image small" />
    <div className="skeleton-stack wide">
      <SkeletonBlock className="skeleton-line short" />
      <SkeletonBlock className="skeleton-line" />
      <SkeletonBlock className="skeleton-line tiny" />
    </div>
  </div>
));

export const OrderCardSkeleton = memo(() => (
  <div className="order-card skeleton-card order-skeleton-card">
    <SkeletonBlock className="skeleton-line short" />
    <div className="skeleton-stack">
      <SkeletonBlock className="skeleton-line" />
      <SkeletonBlock className="skeleton-line" />
    </div>
  </div>
));

export default memo(function Skeleton() {
  return null;
});
