import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { auth, db } from "./components/firebase.config";
import { doc, getDoc } from "firebase/firestore";

// Pages et composants
import Homepage from "./components/Homepage";
import Contact from "./components/Contact";
import Signin from "./components/Signin";
import Signup from "./components/Signup";
import CategoriesPage from "./components/CategoriesPage";
import Header from "./components/Layout/Header";
import AdminHeader from "./components/AdminHeader";
import Footer from "./components/Layout/Footer";
import Ajout from "./components/Ajout";
import Cart from "./components/Cart";
import About from "./components/About";
import AdminProductList from "./components/AdminProductList";
import Profile from "./components/Rania";
import PrivateRoute from "./components/PrivateRoute";
import PaymentForm from "./components/PaymentForm";
import ConfirmationPage from "./components/ConfirmationPage";
import SearchPage from "./components/SearchPage";
import AdminMessages from "./components/AdminMessages";
import Dashboard from "./components/Dashboard";

const App = () => {
  const [cart, setCart] = useState([]); // État global pour le panier
  const [isAdmin, setIsAdmin] = useState(false); // Vérifie si l'utilisateur est admin
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Vérifie si l'utilisateur est connecté

  // Vérifie le statut d'authentification et le rôle de l'utilisateur
  useEffect(() => {
    const checkUserStatus = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          setIsAuthenticated(true);
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === "admin") {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } catch (error) {
            console.error("Erreur lors de la vérification du rôle :", error);
          }
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      });
    };
    checkUserStatus();
  }, []);

  // Ajoute un produit au panier
  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Met à jour la quantité d'un produit dans le panier
  const updateCartItemQuantity = (productId, newQuantity) => {
    setCart(
      cart.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      )
    );
  };

  // Supprime un produit du panier
  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  // Vider le panier après paiement
  const clearCart = () => {
    setCart([]); // Réinitialise l'état du panier
  };

  // Calcul des totaux et quantités dans le panier
  const getCartSummary = () => {
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
    const cartTotal = cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
    return { cartCount, cartTotal };
  };

  return (
    <BrowserRouter>
      {/* Affiche le Header correspondant au rôle */}
      {isAdmin ? (
        <AdminHeader />
      ) : (
        <Header
          cartCount={getCartSummary().cartCount}
          cartTotal={getCartSummary().cartTotal}
        />
      )}

      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Homepage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/categories"
          element={<CategoriesPage cart={cart} addToCart={addToCart} />}
        />
        <Route
          path="/cart"
          element={
            <Cart
              cartItems={cart}
              updateCartItem={updateCartItemQuantity}
              removeFromCart={removeFromCart}
            />
          }
        />

        {/* Routes protégées accessibles uniquement après connexion */}
        <Route
          path="/profil"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/ajout"
          element={
            <PrivateRoute>
              <Ajout />
            </PrivateRoute>
          }
        />
       
  {/* Autres routes */}
  

        {/* Routes d'administration accessibles uniquement aux admins */}
        {isAdmin && (
          <>
            <Route
              path="/admin/products"
              element={
                <PrivateRoute>
                  <AdminProductList />
                </PrivateRoute>
              }
            />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route
              path="/admin/messages"
              element={
                <PrivateRoute>
                  <AdminMessages />
                </PrivateRoute>
              }
            />
          </>
        )}

        {/* Nouvelles routes pour le paiement, la confirmation et la recherche */}
        <Route
          path="/payment"
          element={<PaymentForm clearCart={clearCart} />} // ClearCart passé comme prop
        />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route
          path="/search"
          element={<SearchPage  cartItems={cart}  addToCart={addToCart}  isAuthenticated={isAuthenticated} />}
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;
