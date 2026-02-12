import { useState, useCallback, useRef, useEffect } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
}

interface UsePullToRefreshReturn {
  isRefreshing: boolean;
  pullDistance: number;
  containerRef: React.RefObject<HTMLDivElement>;
  PullIndicator: React.FC;
}

/**
 * Find the nearest scrollable ancestor of an element.
 * This walks up the DOM tree until it finds an element with overflow-y: auto or scroll.
 */
function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let current = el?.parentElement ?? null;
  while (current) {
    const style = getComputedStyle(current);
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 60,
  maxPull = 100,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const scrollParent = useRef<HTMLElement | null>(null);
  const isRefreshingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);

  // Keep refs in sync
  onRefreshRef.current = onRefresh;
  isRefreshingRef.current = isRefreshing;
  pullDistanceRef.current = pullDistance;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Find and cache the scroll parent (the <main> element)
    scrollParent.current = findScrollParent(el);

    // Add overscroll-behavior to prevent browser pull-to-refresh
    if (scrollParent.current) {
      scrollParent.current.style.overscrollBehaviorY = 'none';
    }

    function handleTouchStart(e: TouchEvent) {
      if (isRefreshingRef.current) return;

      // Check if the scroll parent is at the top
      const sp = scrollParent.current;
      const scrollTop = sp ? sp.scrollTop : 0;

      if (scrollTop <= 1) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (!pulling.current || isRefreshingRef.current) return;

      const delta = e.touches[0].clientY - startY.current;

      if (delta > 0) {
        // Pulling down — prevent the browser from scrolling/bouncing
        e.preventDefault();
        const distance = Math.min(delta * 0.5, maxPull);
        pullDistanceRef.current = distance;
        setPullDistance(distance);
      } else {
        // Scrolling up — let the browser handle it
        pulling.current = false;
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    }

    function handleTouchEnd() {
      if (!pulling.current || isRefreshingRef.current) return;
      pulling.current = false;

      const dist = pullDistanceRef.current;

      if (dist >= threshold) {
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        setPullDistance(threshold);
        pullDistanceRef.current = threshold;

        onRefreshRef.current().finally(() => {
          isRefreshingRef.current = false;
          setIsRefreshing(false);
          setPullDistance(0);
          pullDistanceRef.current = 0;
        });
      } else {
        setPullDistance(0);
        pullDistanceRef.current = 0;
      }
    }

    // Use non-passive listeners so we can call preventDefault during pull
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      if (scrollParent.current) {
        scrollParent.current.style.overscrollBehaviorY = '';
      }
    };
  }, [threshold, maxPull]);

  const PullIndicator: React.FC = useCallback(() => {
    if (pullDistance === 0 && !isRefreshing) return null;
    const progress = Math.min(pullDistance / threshold, 1);
    return (
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{ height: pullDistance > 0 ? pullDistance : isRefreshing ? threshold : 0 }}
      >
        <div
          className={`w-6 h-6 border-2 border-primary border-t-transparent rounded-full ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{ opacity: progress, transform: `rotate(${progress * 360}deg)` }}
        />
      </div>
    );
  }, [pullDistance, isRefreshing, threshold]);

  return {
    isRefreshing,
    pullDistance,
    containerRef,
    PullIndicator,
  };
}
