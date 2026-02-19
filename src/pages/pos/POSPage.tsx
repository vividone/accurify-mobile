import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useCreateOrder } from '@/queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatNumber } from '@/utils/currency';
import { useUIStore } from '@/store/ui.store';
import { OrderSource } from '@/types/store.types';
import type { Product } from '@/types/product.types';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

interface CartItem {
  product: Product;
  quantity: number;
}

export function POSPage() {
  const navigate = useNavigate();
  const showNotification = useUIStore((s) => s.showNotification);
  const { data: productsData, isLoading } = useProducts(0, 200, { active: true });
  const createOrder = useCreateOrder();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const products = useMemo(() => {
    const all = productsData?.content ?? [];
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.barcode?.includes(search)
    );
  }, [productsData?.content, search]);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) return prev;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stockQuantity) return item;
          return { ...item, quantity: newQty };
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.product.unitPrice, 0);
  const tax = cart.reduce(
    (sum, item) =>
      sum + (item.product.taxable ? item.quantity * item.product.unitPrice * (item.product.vatRate / 100) : 0),
    0
  );
  const total = subtotal + tax;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCogs = cart.reduce((sum, item) => {
    const cost = (item.product.averageCostPrice && item.product.averageCostPrice > 0)
      ? item.product.averageCostPrice
      : item.product.costPrice;
    return sum + (cost && cost > 0 ? item.quantity * cost : 0);
  }, 0);
  const estimatedProfit = totalCogs > 0 ? subtotal - totalCogs : null;

  const handleCheckout = async () => {
    try {
      await createOrder.mutateAsync({
        source: OrderSource.POS,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.unitPrice,
        })),
      });
      showNotification('Success', 'Order created successfully', 'success');
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setShowCheckout(false);
      navigate('/app/orders');
    } catch {
      showNotification('Error', 'Failed to create order', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="Point of Sale"
        backTo="/app/dashboard"
        actions={
          <button
            onClick={() => cart.length > 0 && setShowCheckout(true)}
            className="relative p-1.5 text-primary active:bg-primary-50 rounded-full"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        }
      />
      <div className="page-content">
        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-40" />
          <input
            type="text"
            placeholder="Search by name, SKU, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Cart summary bar */}
        {cart.length > 0 && (
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full mb-4 p-3 bg-primary text-white rounded-lg flex items-center justify-between"
          >
            <span className="text-body-01 font-medium">
              {cartCount} item{cartCount !== 1 ? 's' : ''} in cart
            </span>
            <span className="text-heading-02 tabular-nums">{formatCurrency(total)}</span>
          </button>
        )}

        {/* Product grid */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={CubeIcon}
            title="No products found"
            description={search ? 'Try a different search term.' : 'Add products to start selling.'}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => {
              const inCart = cart.find((item) => item.product.id === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.outOfStock}
                  className="bg-white rounded-lg shadow-card p-3 text-left active:shadow-card-hover transition-shadow disabled:opacity-50 relative"
                >
                  <div className="w-full h-16 bg-primary-50 rounded-lg flex items-center justify-center mb-2">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <CubeIcon className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <p className="text-body-01 font-medium text-gray-100 truncate">{product.name}</p>
                  <p className="text-heading-02 text-primary tabular-nums mt-0.5">
                    {formatCurrency(product.unitPrice)}
                  </p>
                  <p className="text-helper-01 text-gray-40 tabular-nums">
                    {product.outOfStock ? 'Out of stock' : `${formatNumber(product.stockQuantity)} avail.`}
                  </p>
                  {inCart && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {inCart.quantity}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Checkout bottom sheet */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowCheckout(false)}>
          <div
            className="w-full max-h-[85vh] bg-white rounded-t-2xl flex flex-col"
            style={{ paddingBottom: 'var(--safe-area-bottom)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-20">
              <h3 className="text-heading-02 text-gray-100">Cart</h3>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-body-01 text-gray-50"
              >
                Done
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-10 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-body-01 font-medium text-gray-100 truncate">{item.product.name}</p>
                    <p className="text-helper-01 text-gray-50">{formatCurrency(item.product.unitPrice)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-7 h-7 rounded-full bg-white border border-gray-20 flex items-center justify-center"
                    >
                      <MinusIcon className="w-3.5 h-3.5 text-gray-60" />
                    </button>
                    <span className="w-8 text-center text-body-01 font-medium tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-7 h-7 rounded-full bg-white border border-gray-20 flex items-center justify-center"
                    >
                      <PlusIcon className="w-3.5 h-3.5 text-gray-60" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-danger ml-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-body-01 font-medium tabular-nums text-gray-100 w-20 text-right">
                    {formatCurrency(item.quantity * item.product.unitPrice)}
                  </p>
                </div>
              ))}

              {/* Customer info (optional) */}
              <div className="pt-2 space-y-3">
                <p className="text-label-01 text-gray-70">Customer (optional)</p>
                <input
                  type="text"
                  placeholder="Customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Totals & checkout button */}
            <div className="border-t border-gray-20 p-4 space-y-2">
              <div className="flex justify-between text-body-01 text-gray-70">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between text-body-01 text-gray-70">
                  <span>VAT</span>
                  <span className="tabular-nums">{formatCurrency(tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-heading-02 text-gray-100">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(total)}</span>
              </div>
              {estimatedProfit != null && (
                <div className="flex justify-between text-body-01 text-gray-50 pt-1 border-t border-dashed border-gray-20">
                  <span>Est. Profit</span>
                  <span className={`tabular-nums font-medium ${estimatedProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(estimatedProfit)}
                  </span>
                </div>
              )}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || createOrder.isPending}
                className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50 mt-2"
              >
                {createOrder.isPending ? 'Processing...' : `Complete Sale — ${formatCurrency(total)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
