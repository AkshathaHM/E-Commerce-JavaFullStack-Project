const fetchCartCount = async () => {
  setIsCartLoading(true);
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/cart/items/count?username=${username}`,
      { credentials: 'include' }
    );
    const count = await response.json();
    setCartCount(count);
    setCartError(false);
  } catch (error) {
    console.error('Error fetching cart count:', error);
    setCartError(true);
  } finally {
    setIsCartLoading(false);
  }
};

export default OrderPage;   // ← Add this if missing