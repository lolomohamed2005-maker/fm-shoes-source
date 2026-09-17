import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { CheckoutView } from './views/CheckoutView';
import { OrderSuccessView } from './views/OrderSuccessView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { CustomerAccountView } from './views/CustomerAccountView';
import { AdminView } from './views/AdminView';
import { Product } from './types';

type ViewType =
  | 'home'
  | 'catalog'
  | 'product'
  | 'checkout'
  | 'order_success'
  | 'tracking'
  | 'account'
  | 'admin';

interface NavigationState {
  view: ViewType;
  params?: Record<string, any>;
}

function MainStore() {
  const [navState, setNavState] = useState<NavigationState>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'admin') return { view: 'admin' };
    if (hash === 'tracking') return { view: 'tracking' };
    if (hash === 'account') return { view: 'account' };
    if (hash === 'catalog') return { view: 'catalog' };
    return { view: 'home' };
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string | number | null>(null);
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string>('');

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin') setNavState({ view: 'admin' });
      else if (hash === 'tracking') setNavState({ view: 'tracking' });
      else if (hash === 'account') setNavState({ view: 'account' });
      else if (hash === 'catalog') setNavState({ view: 'catalog' });
      else if (hash === 'checkout') setNavState({ view: 'checkout' });
      else if (!hash) setNavState({ view: 'home' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: string, params?: Record<string, any>) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'product' && params?.id) {
      setSelectedProductId(params.id);
      setNavState({ view: 'product', params });
      window.location.hash = `product-${params.id}`;
      return;
    }

    if (view === 'catalog') {
      if (params?.category) setActiveCategory(params.category);
      if (params?.search) setActiveSearch(params.search);
      setNavState({ view: 'catalog', params });
      window.location.hash = 'catalog';
      return;
    }

    if (view === 'order_success' && params?.orderNumber) {
      setCurrentOrderNumber(params.orderNumber);
      setNavState({ view: 'order_success', params });
      return;
    }

    if (view === 'tracking') {
      if (params?.orderNumber) setCurrentOrderNumber(params.orderNumber);
      setNavState({ view: 'tracking', params });
      window.location.hash = 'tracking';
      return;
    }

    setNavState({ view: view as ViewType, params });
    window.location.hash = view === 'home' ? '' : view;
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProductId(product.id);
    navigateTo('product', { id: product.id });
  };

  // If Admin View is active, render the dedicated Admin View
  if (navState.view === 'admin') {
    return (
      <AdminView
        onBackToStore={() => {
          navigateTo('home');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col font-sans text-stone-900 selection:bg-amber-500 selection:text-stone-950">
      
      {/* Global Store Header */}
      <Header
        currentView={navState.view}
        onNavigate={navigateTo}
        onSearch={(q) => {
          setActiveSearch(q);
          navigateTo('catalog', { search: q });
        }}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          navigateTo('catalog', { category: cat });
        }}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {navState.view === 'home' && (
          <HomeView
            onNavigate={navigateTo}
            onViewProduct={handleViewProduct}
          />
        )}

        {navState.view === 'catalog' && (
          <CatalogView
            initialCategory={activeCategory}
            initialSearch={activeSearch}
            onViewProduct={handleViewProduct}
          />
        )}

        {navState.view === 'product' && selectedProductId && (
          <ProductDetailView
            productIdOrSlug={selectedProductId}
            onNavigate={navigateTo}
            onViewProduct={handleViewProduct}
            onFastBuy={() => navigateTo('checkout')}
          />
        )}

        {navState.view === 'checkout' && (
          <CheckoutView
            onOrderSuccess={(orderNum) => navigateTo('order_success', { orderNumber: orderNum })}
            onBackToCart={() => navigateTo('catalog')}
          />
        )}

        {navState.view === 'order_success' && (
          <OrderSuccessView
            orderNumber={currentOrderNumber || navState.params?.orderNumber || 'KHT-1000'}
            onTrackOrder={(num) => navigateTo('tracking', { orderNumber: num })}
            onReturnHome={() => navigateTo('home')}
          />
        )}

        {navState.view === 'tracking' && (
          <OrderTrackingView
            initialOrderNumber={currentOrderNumber || navState.params?.orderNumber || ''}
            onNavigateHome={() => navigateTo('home')}
          />
        )}

        {navState.view === 'account' && (
          <CustomerAccountView
            initialTab={navState.params?.tab}
            onTrackOrder={(num) => navigateTo('tracking', { orderNumber: num })}
            onViewProduct={handleViewProduct}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Global Shopping Cart Side Drawer */}
      <CartDrawer
        onProceedToCheckout={() => navigateTo('checkout')}
        onContinueShopping={() => navigateTo('catalog')}
      />

      {/* Global Footer */}
      <Footer onNavigate={navigateTo} />

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <MainStore />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
