import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProduct, useUpdateProduct } from '@/queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { useUIStore } from '@/store/ui.store';
import { ProductCategory, PRODUCT_CATEGORY_META } from '@/types/enums';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.nativeEnum(ProductCategory),
  unitPrice: z.number().min(0, 'Min 0'),
  costPrice: z.number().min(0, 'Min 0').optional(),
  unit: z.string().optional(),
  stockQuantity: z.number().min(0, 'Min 0'),
  reorderLevel: z.number().min(0, 'Min 0'),
  taxable: z.boolean(),
  vatRate: z.number().min(0).max(100).optional(),
  lowStockThreshold: z.number().min(0).optional(),
  isPublicVisible: z.boolean().optional(),
  enableBatchTracking: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id!);
  const updateProduct = useUpdateProduct();
  const showNotification = useUIStore((s) => s.showNotification);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    values: product
      ? {
          name: product.name,
          description: product.description ?? '',
          sku: product.sku ?? '',
          barcode: product.barcode ?? '',
          category: product.category,
          unitPrice: product.unitPrice,
          costPrice: product.costPrice ?? 0,
          unit: product.unit || 'pcs',
          stockQuantity: product.stockQuantity,
          reorderLevel: product.reorderLevel,
          taxable: product.taxable,
          vatRate: product.vatRate ?? 7.5,
          lowStockThreshold: product.lowStockThreshold ?? 5,
          isPublicVisible: product.isPublicVisible ?? true,
          enableBatchTracking: product.enableBatchTracking ?? false,
        }
      : undefined,
  });

  const taxable = watch('taxable');

  const onSubmit = async (data: ProductFormData) => {
    if (!id) return;
    try {
      await updateProduct.mutateAsync({
        id,
        data: {
          ...data,
          costPrice: data.costPrice || undefined,
          vatRate: data.taxable ? data.vatRate : 0,
        },
      });
      showNotification('Success', 'Product updated', 'success');
      navigate(`/app/products/${id}`);
    } catch {
      showNotification('Error', 'Failed to update product', 'error');
    }
  };

  if (isLoading || !product) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <PageHeader title="Edit Product" backTo={`/app/products/${id}`} />
      <div className="page-content">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Basic info */}
          <Card>
            <div className="space-y-3">
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Product Name</label>
                <input
                  placeholder="e.g. iPhone 15 Pro"
                  className={`w-full h-12 px-4 bg-gray-10 border text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.name ? 'border-danger' : 'border-gray-30'
                  }`}
                  {...register('name')}
                />
                {errors.name && <p className="mt-1 text-helper-01 text-danger">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief product description..."
                  className="w-full px-3 py-2 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  {...register('description')}
                />
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Category</label>
                <select
                  className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  {...register('category')}
                >
                  {Object.entries(PRODUCT_CATEGORY_META).map(([key, meta]) => (
                    <option key={key} value={key}>{meta.displayName}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Identifiers */}
          <Card>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">SKU (optional)</label>
                <input
                  placeholder="e.g. IP15P-256"
                  className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary"
                  {...register('sku')}
                />
              </div>
              <div>
                <label className="block text-label-01 text-gray-70 mb-1.5">Barcode (optional)</label>
                <input
                  placeholder="e.g. 12345678"
                  className="w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary"
                  {...register('barcode')}
                />
              </div>
            </div>
          </Card>

          {/* Pricing */}
          <Card>
            <p className="text-label-01 text-gray-70 mb-3">Pricing</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-helper-01 text-gray-50 mb-1">Selling Price</label>
                <Controller
                  name="unitPrice"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={0.01}
                      className={`w-full h-12 px-3 bg-gray-10 border text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.unitPrice ? 'border-danger' : 'border-gray-30'
                      }`}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-helper-01 text-gray-50 mb-1">Cost Price</label>
                <Controller
                  name="costPrice"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={0.01}
                      className="w-full h-12 px-3 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-helper-01 text-gray-50 mb-1">Unit</label>
              <input
                placeholder="pcs, kg, litres..."
                className="w-full h-12 px-3 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary"
                {...register('unit')}
              />
            </div>
          </Card>

          {/* Inventory */}
          <Card>
            <p className="text-label-01 text-gray-70 mb-3">Inventory</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-helper-01 text-gray-50 mb-1">Stock Quantity</label>
                <Controller
                  name="stockQuantity"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className="w-full h-12 px-3 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-helper-01 text-gray-50 mb-1">Reorder Level</label>
                <Controller
                  name="reorderLevel"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className="w-full h-12 px-3 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-helper-01 text-gray-50 mb-1">Low Stock Threshold</label>
              <Controller
                name="lowStockThreshold"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className="w-full h-12 px-3 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={field.value ?? 5}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                )}
              />
            </div>
          </Card>

          {/* Visibility & Batch Tracking */}
          <Card>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-label-01 text-gray-70">Visible on Storefront</label>
                <Controller
                  name="isPublicVisible"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      onClick={() => field.onChange(!field.value)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        field.value ? 'bg-primary' : 'bg-gray-30'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          field.value ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  )}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-label-01 text-gray-70">Batch Tracking</label>
                  <p className="text-helper-01 text-gray-40">Track expiry dates and batch numbers</p>
                </div>
                <Controller
                  name="enableBatchTracking"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      onClick={() => field.onChange(!field.value)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        field.value ? 'bg-primary' : 'bg-gray-30'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          field.value ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Tax */}
          <Card>
            <div className="flex items-center justify-between">
              <label className="text-label-01 text-gray-70">VAT Applicable</label>
              <Controller
                name="taxable"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      field.value ? 'bg-primary' : 'bg-gray-30'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        field.value ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                )}
              />
            </div>
            {taxable && (
              <div className="mt-3">
                <label className="block text-helper-01 text-gray-50 mb-1">VAT Rate (%)</label>
                <Controller
                  name="vatRate"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={100}
                      step={0.5}
                      className="w-full h-12 px-3 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={field.value ?? 7.5}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
            )}
          </Card>

          {/* Submit */}
          <div className="pt-2 pb-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
