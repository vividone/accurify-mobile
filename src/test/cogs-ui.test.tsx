import { describe, it, expect } from 'vitest';

/**
 * Unit tests for COGS Engine UI logic in the mobile app.
 * Tests the data transformations and display logic without rendering full components.
 */

describe('COGS Dashboard Metrics', () => {
  it('should include netProfit card when dashboard data has profit metrics', () => {
    const dashboard = {
      thisMonthRevenue: 500000,
      netProfit: 125000,
      grossProfit: 200000,
      grossMarginPercent: 40.0,
      unpaidInvoicesTotal: 50000,
      unpaidInvoicesCount: 3,
      revenueChangePercent: 12.5,
      uncategorizedTransactionsCount: 2,
      recentActivity: [],
      revenue: {
        totalInflows: 500000,
        revenue: 500000,
        vatThreshold: 25000000,
        citThreshold: 50000000,
        vatStatus: 'BELOW' as const,
        citStatus: 'BELOW' as const,
        zone: 'SAFE' as const,
        revenuePercentOfCit: 1,
        remainingToCit: 49500000,
      },
    };

    // Simulate the summaryCards logic from DashboardPage
    const summaryCards = [
      { label: 'Revenue', value: dashboard.thisMonthRevenue },
      ...(dashboard.netProfit != null
        ? [
            {
              label: 'Net Profit',
              value: dashboard.netProfit,
              sub:
                dashboard.grossMarginPercent != null
                  ? `${dashboard.grossMarginPercent.toFixed(1)}% margin`
                  : undefined,
            },
          ]
        : []),
      { label: 'Outstanding', value: dashboard.unpaidInvoicesTotal },
    ];

    expect(summaryCards).toHaveLength(3);
    expect(summaryCards[1].label).toBe('Net Profit');
    expect(summaryCards[1].value).toBe(125000);
    expect(summaryCards[1].sub).toBe('40.0% margin');
  });

  it('should not include netProfit card when profit metrics are absent', () => {
    const dashboard = {
      thisMonthRevenue: 500000,
      netProfit: undefined as number | undefined,
      grossProfit: undefined as number | undefined,
      grossMarginPercent: undefined as number | undefined,
      unpaidInvoicesTotal: 50000,
      unpaidInvoicesCount: 3,
      revenueChangePercent: 12.5,
      uncategorizedTransactionsCount: 2,
    };

    const summaryCards = [
      { label: 'Revenue', value: dashboard.thisMonthRevenue },
      ...(dashboard.netProfit != null
        ? [{ label: 'Net Profit', value: dashboard.netProfit }]
        : []),
      { label: 'Outstanding', value: dashboard.unpaidInvoicesTotal },
    ];

    expect(summaryCards).toHaveLength(2);
    expect(summaryCards.find((c) => c.label === 'Net Profit')).toBeUndefined();
  });

  it('should show negative profit with correct styling indicator', () => {
    const netProfit = -50000;
    const color = netProfit >= 0 ? 'text-success' : 'text-danger';
    expect(color).toBe('text-danger');
  });
});

describe('Product WAC and Margin Calculations', () => {
  it('should use averageCostPrice for margin when available', () => {
    const product = {
      unitPrice: 20000, // ₦200
      costPrice: 10000, // ₦100 (static)
      averageCostPrice: 12500, // ₦125 (WAC after multiple purchases)
    };

    const effectiveCost =
      product.averageCostPrice && product.averageCostPrice > 0
        ? product.averageCostPrice
        : product.costPrice;

    const margin =
      effectiveCost && effectiveCost > 0
        ? ((product.unitPrice - effectiveCost) / product.unitPrice) * 100
        : null;

    expect(effectiveCost).toBe(12500);
    expect(margin).toBeCloseTo(37.5, 1);
  });

  it('should fall back to costPrice when averageCostPrice is zero', () => {
    const product = {
      unitPrice: 20000,
      costPrice: 10000,
      averageCostPrice: 0,
    };

    const effectiveCost =
      product.averageCostPrice && product.averageCostPrice > 0
        ? product.averageCostPrice
        : product.costPrice;

    expect(effectiveCost).toBe(10000);
  });

  it('should fall back to costPrice when averageCostPrice is undefined', () => {
    const product = {
      unitPrice: 20000,
      costPrice: 10000,
      averageCostPrice: undefined as number | undefined,
    };

    const effectiveCost =
      product.averageCostPrice && product.averageCostPrice > 0
        ? product.averageCostPrice
        : product.costPrice;

    expect(effectiveCost).toBe(10000);
  });

  it('should return null margin when no cost price is available', () => {
    const product = {
      unitPrice: 20000,
      costPrice: undefined as number | undefined,
      averageCostPrice: undefined as number | undefined,
    };

    const effectiveCost =
      product.averageCostPrice && product.averageCostPrice > 0
        ? product.averageCostPrice
        : product.costPrice;

    const margin =
      effectiveCost && effectiveCost > 0
        ? ((product.unitPrice - effectiveCost) / product.unitPrice) * 100
        : null;

    expect(margin).toBeNull();
  });

  it('should calculate inventory value using WAC', () => {
    const product = {
      unitPrice: 20000,
      averageCostPrice: 12500,
      costPrice: 10000,
      stockQuantity: 20,
    };

    const effectiveCost =
      product.averageCostPrice && product.averageCostPrice > 0
        ? product.averageCostPrice
        : product.costPrice;

    const inventoryValue =
      effectiveCost && effectiveCost > 0
        ? effectiveCost * product.stockQuantity
        : null;

    expect(inventoryValue).toBe(250000); // 12500 × 20 = 250,000 kobo = ₦2,500
  });

  it('should detect negative margin (selling below cost)', () => {
    const product = {
      unitPrice: 10000, // ₦100
      averageCostPrice: 15000, // ₦150 (cost > price)
      costPrice: 10000,
    };

    const effectiveCost =
      product.averageCostPrice && product.averageCostPrice > 0
        ? product.averageCostPrice
        : product.costPrice;

    const margin =
      effectiveCost && effectiveCost > 0
        ? ((product.unitPrice - effectiveCost) / product.unitPrice) * 100
        : null;

    expect(margin).toBeLessThan(0);
    expect(margin).toBeCloseTo(-50, 0);
  });
});

describe('Product List Margin Indicator', () => {
  it('should color-code margins: green >= 20%, yellow >= 10%, red < 10%', () => {
    const getMarginColor = (margin: number) => {
      if (margin >= 20) return 'text-success';
      if (margin >= 10) return 'text-warning-dark';
      return 'text-danger';
    };

    expect(getMarginColor(35)).toBe('text-success');
    expect(getMarginColor(20)).toBe('text-success');
    expect(getMarginColor(15)).toBe('text-warning-dark');
    expect(getMarginColor(10)).toBe('text-warning-dark');
    expect(getMarginColor(5)).toBe('text-danger');
    expect(getMarginColor(0)).toBe('text-danger');
  });
});

describe('POS Estimated Profit Calculation', () => {
  it('should calculate total COGS using WAC for cart items', () => {
    const cart = [
      {
        product: {
          id: '1',
          name: 'Product A',
          unitPrice: 20000,
          averageCostPrice: 12500,
          costPrice: 10000,
          stockQuantity: 50,
          taxable: false,
          vatRate: 0,
        },
        quantity: 3,
      },
      {
        product: {
          id: '2',
          name: 'Product B',
          unitPrice: 15000,
          averageCostPrice: 8000,
          costPrice: 7000,
          stockQuantity: 30,
          taxable: false,
          vatRate: 0,
        },
        quantity: 2,
      },
    ];

    const totalCogs = cart.reduce((sum, item) => {
      const cost =
        item.product.averageCostPrice && item.product.averageCostPrice > 0
          ? item.product.averageCostPrice
          : item.product.costPrice;
      return sum + (cost && cost > 0 ? item.quantity * cost : 0);
    }, 0);

    const subtotal = cart.reduce(
      (sum, item) => sum + item.quantity * item.product.unitPrice,
      0
    );

    const estimatedProfit = totalCogs > 0 ? subtotal - totalCogs : null;

    // Product A: 3 × 12500 = 37500
    // Product B: 2 × 8000 = 16000
    // Total COGS: 53500
    expect(totalCogs).toBe(53500);

    // Subtotal: 3 × 20000 + 2 × 15000 = 90000
    expect(subtotal).toBe(90000);

    // Profit: 90000 - 53500 = 36500
    expect(estimatedProfit).toBe(36500);
  });

  it('should handle cart items without cost prices gracefully', () => {
    const cart = [
      {
        product: {
          id: '1',
          name: 'Free Sample',
          unitPrice: 5000,
          averageCostPrice: 0,
          costPrice: undefined as number | undefined,
          stockQuantity: 10,
        },
        quantity: 1,
      },
    ];

    const totalCogs = cart.reduce((sum, item) => {
      const cost =
        item.product.averageCostPrice && item.product.averageCostPrice > 0
          ? item.product.averageCostPrice
          : item.product.costPrice;
      return sum + (cost && cost > 0 ? item.quantity * cost : 0);
    }, 0);

    const estimatedProfit = totalCogs > 0 ? 5000 - totalCogs : null;

    expect(totalCogs).toBe(0);
    expect(estimatedProfit).toBeNull();
  });
});

describe('Sale Modal COGS Display', () => {
  it('should calculate COGS and profit for sale quantity', () => {
    const product = {
      unitPrice: 20000,
      averageCostPrice: 12500,
      costPrice: 10000,
    };
    const saleQty = 5;

    const effectiveCost =
      product.averageCostPrice && product.averageCostPrice > 0
        ? product.averageCostPrice
        : product.costPrice;

    const totalRevenue = saleQty * product.unitPrice;
    const totalCogs = effectiveCost ? saleQty * effectiveCost : 0;
    const profit = totalRevenue - totalCogs;

    expect(totalRevenue).toBe(100000); // 5 × 20000
    expect(totalCogs).toBe(62500); // 5 × 12500
    expect(profit).toBe(37500); // 100000 - 62500
  });
});
