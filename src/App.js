import React, { useState, useEffect } from 'react';
import { CssBaseline } from '@material-ui/core';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Navbar, Products, Cart, Checkout } from './components';
import { commerce } from './lib/commerce';

const App = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [order, setOrder] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProducts = async () => {
    const { data } = await commerce.products.list();

    setProducts(data);
  };

  const fetchCart = async () => {
    setCart(await commerce.cart.retrieve());
  };

  const handleAddToCart = (productId, quantity) => {
    commerce.cart.add(productId, quantity).then((res) => setCart(res));

    // setCart(cart);
  };

  const handleUpdateCartQty = async (lineItemId, quantity) => {
    const {cart} = await commerce.cart.update(lineItemId, { quantity });

    setCart(cart);
  };

  const handleRemoveFromCart = (lineItemId) => {
    commerce.cart.remove(lineItemId).then((res) => setCart(res));

    // setCart(cart);
  };

  const handleEmptyCart = () => {
    commerce.cart.empty().then(res => setCart(res))

    // setCart(cart);
  };

  const refreshCart = async () => {
    const newCart = await commerce.cart.refresh();

    setCart(newCart);
  };

  const handleCaptureCheckout = async (checkoutTokenId, newOrder) => {
    try {
      const incomingOrder = await commerce.checkout.capture(checkoutTokenId, newOrder);

      setOrder(incomingOrder);

      refreshCart();
    } catch (error) {
      setErrorMessage(error.data.error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  console.log(cart.total_items)
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <CssBaseline />
        <Navbar totalItems={cart.total_items} handleDrawerToggle={handleDrawerToggle} />
        <Routes>
          
          <Route exact path="/" element={<Products products={products} onAddToCart={handleAddToCart} handleUpdateCartQty/>}/>
          
          <Route exact path="/cart" element={<Cart cart={cart} onUpdateCartQty={handleUpdateCartQty} onRemoveFromCart={handleRemoveFromCart} onEmptyCart={handleEmptyCart}/>}/>
            
          <Route exact path="/checkout" element={<Checkout cart={cart} order={order} onCaptureCheckout={handleCaptureCheckout} error={errorMessage} />}/>

        </Routes>
      </div>
    </Router>
  );
};

export default App;
