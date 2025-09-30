import { Link } from 'react-router-dom';
import { useCurrentRoute, navigationItems } from '../router/navigation';
import { Button } from '@/components/ui/button';

export const Navigation = () => {
  const { isActive } = useCurrentRoute();

  return (
    <nav className="flex items-center space-x-4 p-4 bg-white shadow-sm border-b">
      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold text-primary">My App</span>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="flex items-center space-x-2">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to={item.path} className="flex items-center space-x-2">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
