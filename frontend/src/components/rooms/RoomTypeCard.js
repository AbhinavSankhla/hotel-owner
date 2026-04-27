import { formatCurrency } from '@/lib/utils';

export default function RoomTypeCard({ roomType, onSelect, selected }) {
  const { name, description, basePrice, maxGuests, amenities } = roomType;
  const amenityList = Array.isArray(amenities) ? amenities : [];

  return (
    <div
      onClick={() => onSelect?.(roomType)}
      className={`card p-4 cursor-pointer border-2 transition-all ${
        selected ? 'border-primary-500 bg-primary-50' : 'border-transparent hover:border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          {description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{description}</p>}
          <p className="text-sm text-gray-500 mt-1">Up to {maxGuests} guests</p>
        </div>
        <div className="text-right ml-4 flex-shrink-0">
          <p className="font-bold text-primary-700 text-lg">{formatCurrency(basePrice)}</p>
          <p className="text-xs text-gray-400">per night</p>
        </div>
      </div>

      {amenityList.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {amenityList.slice(0, 6).map((a, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
          ))}
          {amenityList.length > 6 && (
            <span className="text-xs text-gray-400">+{amenityList.length - 6} more</span>
          )}
        </div>
      )}
    </div>
  );
}
