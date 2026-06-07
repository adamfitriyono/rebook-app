import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, count = 0, size = 16 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
      {count > 0 && <span className="text-sm text-subtle ml-1">({count})</span>}
    </div>
  );
}
