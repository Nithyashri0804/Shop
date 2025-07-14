import { productsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const FeaturedProducts: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleToggleWishlist = (product: any) => {
    if (!user) {
      showToast('Please login to add items to wishlist', 'warning');
      return;
    }
    toggleWishlist(product);
  };

  return (
    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <button 
        onClick={() => handleToggleWishlist(product)}
        className={`p-2 rounded-full shadow-md transition-colors mb-2 ${
          isInWishlist(product._id)
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Heart size={16} className={isInWishlist(product._id) ? 'fill-current' : ''} />
      </button>
    </div>
  );
}