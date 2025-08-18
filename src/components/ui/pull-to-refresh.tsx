import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className,
  disabled = false,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || startY === 0) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, MAX_PULL));
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing || pullDistance < PULL_THRESHOLD) {
      setPullDistance(0);
      setStartY(0);
      return;
    }

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setStartY(0);
    }
  };

  const pullPercentage = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const showRefreshIcon = pullDistance > 20;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto touch-pan-y', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-background/95 backdrop-blur-sm border-b transition-all duration-300 ease-out z-10"
        style={{
          height: Math.max(pullDistance, 0),
          opacity: showRefreshIcon ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw
            className={cn(
              'h-5 w-5 transition-transform duration-200',
              isRefreshing && 'animate-spin',
              !isRefreshing && pullPercentage >= 1 && 'rotate-180'
            )}
          />
          <span className="text-sm font-medium">
            {isRefreshing
              ? 'Refreshing...'
              : pullPercentage >= 1
              ? 'Release to refresh'
              : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${isRefreshing ? 60 : pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};