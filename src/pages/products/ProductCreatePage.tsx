import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProduct, useUploadProductImage } from '@/queries';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { useUIStore } from '@/store/ui.store';
import { ProductCategory, PRODUCT_CATEGORY_META } from '@/types/enums';
import type { Product } from '@/types/product.types';
import { CubeIcon, CameraIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

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
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductCreatePage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const uploadImage = useUploadProductImage();
  const showNotification = useUIStore((s) => s.showNotification);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
  const [imageUploaded, setImageUploaded] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      barcode: '',
      category: ProductCategory.OTHER,
      unitPrice: 0,
      costPrice: 0,
      unit: 'pcs',
      stockQuantity: 0,
      reorderLevel: 5,
      taxable: false,
      vatRate: 7.5,
    },
  });

  const taxable = watch('taxable');

  const onSubmit = async (data: ProductFormData) => {
    try {
      const product = await createProduct.mutateAsync({
        ...data,
        costPrice: data.costPrice || undefined,
        vatRate: data.taxable ? data.vatRate : 0,
      });
      showNotification('Success', 'Product created', 'success');
      setCreatedProduct(product);
    } catch {
      showNotification('Error', 'Failed to create product', 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createdProduct) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('Error', 'Only JPEG, PNG, GIF, and WebP images are allowed', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showNotification('Error', 'Image must be less than 2MB', 'error');
      return;
    }

    try {
      await uploadImage.mutateAsync({ productId: createdProduct.id, file });
      showNotification('Success', 'Product image uploaded', 'success');
      setImageUploaded(true);
    } catch {
      showNotification('Error', 'Failed to upload image', 'error');
    }

    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // Step 2: Image upload
  if (createdProduct) {
    return (
      <>
        <PageHeader title="Add Product Image" backTo="/app/products" />
        <div className="page-content">
          <div className="flex flex-col items-center pt-8 space-y-6">
            {/* Success confirmation */}
            <div className="flex flex-col items-center text-center">
              <CheckCircleIcon className="w-12 h-12 text-success mb-2" />
              <h2 className="text-heading-03 text-gray-100 font-semibold">
                {createdProduct.name}
              </h2>
              <p className="text-body-01 text-gray-50">Product created successfully</p>
            </div>

            {/* Image upload area */}
            <Card>
              <p className="text-label-01 text-gray-70 mb-3">Product Image (optional)</p>
              <div className="flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadImage.isPending}
                  className="relative w-28 h-28 rounded-lg flex items-center justify-center overflow-hidden bg-primary-50 border-2 border-dashed border-primary/30 cursor-pointer"
                >
                  {imageUploaded ? (
                    <CheckCircleIcon className="w-10 h-10 text-success" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <CameraIcon className="w-8 h-8 text-primary" />
                      <span className="text-helper-01 text-primary">Tap to upload</span>
                    </div>
                  )}
                  {uploadImage.isPending && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <p className="text-helper-01 text-gray-40">JPEG, PNG, GIF, or WebP. Max 2MB.</p>
                {imageUploaded && (
                  <p className="text-body-01 text-success font-medium">Image uploaded!</p>
                )}
              </div>
            </Card>

            {/* Action buttons */}
            <div className="w-full space-y-2 pt-4 pb-4">
              <button
                onClick={() => navigate(`/app/products/${createdProduct.id}`)}
                className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg"
              >
                {imageUploaded ? 'View Product' : 'Done'}
              </button>
              {!imageUploaded && (
                <button
                  onClick={() => navigate('/app/products')}
                  className="w-full h-12 border border-gray-30 text-gray-70 font-medium text-body-01 rounded-lg"
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Step 1: Product details form
  return (
    <>
      <PageHeader title="New Product" backTo="/app/products" />
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
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
