import { useState, ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EntityListProps<T> {
  title: string;
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchKeys: (keyof T)[];
  filterOptions?: Array<{
    key: keyof T;
    value: any;
    label: string;
  }>;
  renderItem: (item: T, index: number) => ReactNode;
  emptyState?: ReactNode;
  onRefresh?: () => void;
  className?: string;
}

export function EntityList<T extends Record<string, any>>({
  title,
  data,
  loading = false,
  searchPlaceholder = "Search...",
  searchKeys,
  filterOptions = [],
  renderItem,
  emptyState,
  onRefresh,
  className
}: EntityListProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  const filteredData = data.filter((item) => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      searchKeys.some(key => 
        String(item[key]).toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Active filters
    const matchesFilters = activeFilters.size === 0 || 
      filterOptions.some(filter => 
        activeFilters.has(`${String(filter.key)}-${filter.value}`) && 
        item[filter.key] === filter.value
      );

    return matchesSearch && matchesFilters;
  });

  const toggleFilter = (key: keyof T, value: any) => {
    const filterKey = `${String(key)}-${value}`;
    const newFilters = new Set(activeFilters);
    
    if (newFilters.has(filterKey)) {
      newFilters.delete(filterKey);
    } else {
      newFilters.add(filterKey);
    }
    
    setActiveFilters(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters(new Set());
    setSearchTerm('');
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {title}
            <Badge variant="secondary" className="ml-2">
              {filteredData.length}
            </Badge>
          </CardTitle>
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        {filterOptions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filters:
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => {
                const filterKey = `${String(filter.key)}-${filter.value}`;
                const isActive = activeFilters.has(filterKey);
                
                return (
                  <Button
                    key={filterKey}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFilter(filter.key, filter.value)}
                    className="h-8"
                  >
                    {filter.label}
                  </Button>
                );
              })}
              {(activeFilters.size > 0 || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-muted-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredData.length > 0 ? (
          <div className="space-y-4">
            {filteredData.map((item, index) => renderItem(item, index))}
          </div>
        ) : (
          emptyState || (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-lg font-medium mb-2">No items found</div>
              <div className="text-sm">
                {searchTerm || activeFilters.size > 0 
                  ? "Try adjusting your search or filters"
                  : "No data available"
                }
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}