export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-4' };
  return (
    <div className={`animate-spin rounded-full border-gray-200 border-t-primary-600 ${sizes[size]} ${className}`} />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
