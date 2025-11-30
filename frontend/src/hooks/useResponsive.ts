import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Hook that provides responsive screen dimensions that update on orientation change
 */
export function useScreenDimensions() {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window !== 'undefined') {
      // For web, use window dimensions directly
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        scale: window.devicePixelRatio || 1,
        fontScale: 1,
      };
    }
    return Dimensions.get('window');
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // For web, listen to window resize
      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
          scale: window.devicePixelRatio || 1,
          fontScale: 1,
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    } else {
      // For native, use Dimensions API
      const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
        setDimensions(window);
      });

      return () => subscription?.remove();
    }
  }, []);

  return dimensions;
}

/**
 * Hook that provides responsive utilities including screen dimensions and safe area insets
 */
export function useResponsive() {
  const { width, height } = useScreenDimensions();
  const insets = useSafeAreaInsets();

  // Calculate responsive values
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;
  const isLargeScreen = width >= 768;
  const isTablet = width >= 768;
  const isPhone = width < 768;

  // Responsive font scaling (based on width)
  const scaleFont = (size: number) => {
    const scale = width / 375; // Base width is iPhone X/11/12 (375)
    return Math.max(size * Math.min(scale, 1.2), size * 0.9); // Limit scaling
  };

  // Responsive spacing
  const scaleSpacing = (spacing: number) => {
    const scale = width / 375;
    return spacing * Math.min(scale, 1.3);
  };

  return {
    width,
    height,
    insets,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isTablet,
    isPhone,
    scaleFont,
    scaleSpacing,
  };
}

/**
 * Helper function to calculate responsive padding that accounts for safe areas
 */
export function useResponsivePadding() {
  const { insets, scaleSpacing } = useResponsive();

  return {
    paddingTop: Math.max(insets.top, scaleSpacing(16)),
    paddingBottom: Math.max(insets.bottom, scaleSpacing(16)),
    paddingHorizontal: scaleSpacing(24),
    safeAreaTop: insets.top,
    safeAreaBottom: insets.bottom,
  };
}

