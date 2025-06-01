/**
 * iOS Performance Optimization Configuration
 * Advanced settings for optimal iOS app performance
 */

export interface IOSPerformanceConfig {
  // Memory management
  memoryOptimization: {
    maxCacheSize: number;
    preloadLimit: number;
    garbageCollectionThreshold: number;
    imageCompressionQuality: number;
  };
  
  // Rendering optimization
  renderingOptimization: {
    virtualScrollingThreshold: number;
    lazyLoadingOffset: number;
    animationFrameRate: number;
    debounceDelay: number;
  };
  
  // Network optimization
  networkOptimization: {
    requestTimeout: number;
    maxConcurrentRequests: number;
    retryAttempts: number;
    cacheStrategy: 'aggressive' | 'balanced' | 'minimal';
  };
  
  // UI optimization
  uiOptimization: {
    touchResponseDelay: number;
    scrollingOptimization: boolean;
    hapticFeedback: boolean;
    safeAreaHandling: boolean;
  };
}

export const defaultIOSPerformanceConfig: IOSPerformanceConfig = {
  memoryOptimization: {
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    preloadLimit: 5, // articles
    garbageCollectionThreshold: 0.8, // 80% memory usage
    imageCompressionQuality: 0.8
  },
  
  renderingOptimization: {
    virtualScrollingThreshold: 100, // items
    lazyLoadingOffset: 200, // pixels
    animationFrameRate: 60, // fps
    debounceDelay: 150 // ms
  },
  
  networkOptimization: {
    requestTimeout: 10000, // 10 seconds
    maxConcurrentRequests: 3,
    retryAttempts: 3,
    cacheStrategy: 'balanced'
  },
  
  uiOptimization: {
    touchResponseDelay: 0, // immediate
    scrollingOptimization: true,
    hapticFeedback: true,
    safeAreaHandling: true
  }
};

/**
 * iOS-specific performance utilities
 */
export class IOSPerformanceManager {
  private config: IOSPerformanceConfig;
  private memoryUsage: number = 0;
  private performanceMetrics: Map<string, number> = new Map();
  
  constructor(config: IOSPerformanceConfig = defaultIOSPerformanceConfig) {
    this.config = config;
    this.initializePerformanceMonitoring();
  }
  
  private initializePerformanceMonitoring() {
    // Monitor memory usage
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.performanceMetrics.set(entry.name, entry.duration);
        }
      });
      
      try {
        observer.observe({ entryTypes: ['navigation', 'paint', 'measure'] });
      } catch (error) {
        console.warn('Performance observer not supported:', error);
      }
    }
  }
  
  /**
   * Optimize image loading for iOS
   */
  optimizeImageLoading(imageUrl: string): string {
    const { imageCompressionQuality } = this.config.memoryOptimization;
    
    // Add iOS-specific image optimization parameters
    const url = new URL(imageUrl);
    url.searchParams.set('quality', (imageCompressionQuality * 100).toString());
    url.searchParams.set('format', 'webp');
    url.searchParams.set('ios-optimized', 'true');
    
    return url.toString();
  }
  
  /**
   * Implement iOS-specific scroll optimization
   */
  optimizeScrolling(element: HTMLElement) {
    if (this.config.uiOptimization.scrollingOptimization) {
      element.style.webkitOverflowScrolling = 'touch';
      element.style.scrollBehavior = 'smooth';
      
      // Add momentum scrolling for iOS
      element.addEventListener('touchstart', () => {
        element.style.webkitOverflowScrolling = 'auto';
      }, { passive: true });
      
      element.addEventListener('touchend', () => {
        setTimeout(() => {
          element.style.webkitOverflowScrolling = 'touch';
        }, 100);
      }, { passive: true });
    }
  }
  
  /**
   * Memory management for iOS
   */
  manageMemory() {
    const { maxCacheSize, garbageCollectionThreshold } = this.config.memoryOptimization;
    
    // Estimate memory usage
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.memoryUsage = memory.usedJSHeapSize;
      
      const memoryRatio = this.memoryUsage / memory.jsHeapSizeLimit;
      
      if (memoryRatio > garbageCollectionThreshold) {
        this.triggerGarbageCollection();
      }
    }
  }
  
  private triggerGarbageCollection() {
    // Clear caches and trigger cleanup
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('temp') || cacheName.includes('preview')) {
            caches.delete(cacheName);
          }
        });
      });
    }
    
    // Clear image cache
    this.clearImageCache();
  }
  
  private clearImageCache() {
    const images = document.querySelectorAll('img[data-cached="true"]');
    images.forEach(img => {
      if (img instanceof HTMLImageElement) {
        img.removeAttribute('data-cached');
        // Force reload from network next time
        img.src = img.src + '?cache-bust=' + Date.now();
      }
    });
  }
  
  /**
   * Network request optimization for iOS
   */
  optimizeNetworkRequest(url: string, options: RequestInit = {}): RequestInit {
    const { requestTimeout, cacheStrategy } = this.config.networkOptimization;
    
    return {
      ...options,
      signal: AbortSignal.timeout(requestTimeout),
      cache: cacheStrategy === 'aggressive' ? 'force-cache' : 
             cacheStrategy === 'minimal' ? 'no-cache' : 'default',
      headers: {
        ...options.headers,
        'User-Agent': 'CocoaReader-iOS/1.0',
        'X-Requested-With': 'CocoaReader'
      }
    };
  }
  
  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      memoryUsage: this.memoryUsage,
      performanceEntries: Object.fromEntries(this.performanceMetrics),
      config: this.config
    };
  }
  
  /**
   * Apply iOS-specific optimizations to an element
   */
  applyIOSOptimizations(element: HTMLElement) {
    // Add iOS-specific CSS optimizations
    element.style.webkitTapHighlightColor = 'transparent';
    element.style.webkitTouchCallout = 'none';
    element.style.webkitUserSelect = 'none';
    
    // Enable hardware acceleration
    element.style.transform = 'translateZ(0)';
    element.style.willChange = 'transform';
    
    // Optimize scrolling
    if (element.scrollHeight > element.clientHeight) {
      this.optimizeScrolling(element);
    }
  }
  
  /**
   * Haptic feedback for iOS
   */
  triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
    if (this.config.uiOptimization.hapticFeedback && 'navigator' in window) {
      try {
        // Use Capacitor Haptics if available
        if ((window as any).Capacitor) {
          import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
            const style = type === 'light' ? ImpactStyle.Light :
                         type === 'medium' ? ImpactStyle.Medium :
                         ImpactStyle.Heavy;
            Haptics.impact({ style });
          }).catch(() => {
            // Fallback to web vibration API
            if ('vibrate' in navigator) {
              const duration = type === 'light' ? 10 :
                              type === 'medium' ? 20 : 30;
              navigator.vibrate(duration);
            }
          });
        } else if ('vibrate' in navigator) {
          const duration = type === 'light' ? 10 :
                          type === 'medium' ? 20 : 30;
          navigator.vibrate(duration);
        }
      } catch (error) {
        console.warn('Haptic feedback not available:', error);
      }
    }
  }
}

// Global instance
export const iosPerformanceManager = new IOSPerformanceManager();
