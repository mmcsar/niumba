// Niumba - Animation Utilities
// Fonctions utilitaires pour les animations fluides
import { useState, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Animation de fade in
 */
export const fadeIn = (value: Animated.Value, duration: number = 300) => {
  return Animated.timing(value, {
    toValue: 1,
    duration,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
};

/**
 * Animation de fade out
 */
export const fadeOut = (value: Animated.Value, duration: number = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  });
};

/**
 * Animation de slide in depuis le bas
 */
export const slideInUp = (value: Animated.Value, duration: number = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
};

/**
 * Animation de slide out vers le bas
 */
export const slideOutDown = (value: Animated.Value, duration: number = 300) => {
  return Animated.timing(value, {
    toValue: 1000,
    duration,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  });
};

/**
 * Animation de scale (zoom)
 */
export const scaleIn = (value: Animated.Value, duration: number = 300) => {
  return Animated.spring(value, {
    toValue: 1,
    friction: 7,
    tension: 40,
    useNativeDriver: true,
  });
};

/**
 * Animation de scale out
 */
export const scaleOut = (value: Animated.Value, duration: number = 200) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  });
};

/**
 * Animation de bounce
 */
export const bounce = (value: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 1.2,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 1,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Animation de shake (pour les erreurs)
 */
export const shake = (value: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: -10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: -10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Animation de pulse
 */
export const pulse = (value: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1.1,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

/**
 * Hook pour animation de fade
 */
export const useFadeAnimation = (initialValue: number = 0) => {
  const [fadeAnim] = useState(new Animated.Value(initialValue));

  const fadeIn = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const fadeOut = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return { fadeAnim, fadeIn, fadeOut };
};

/**
 * Hook pour animation de slide
 */
export const useSlideAnimation = (initialValue: number = -100) => {
  const [slideAnim] = useState(new Animated.Value(initialValue));

  const slideIn = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 7,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const slideOut = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: initialValue,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [slideAnim, initialValue]);

  return { slideAnim, slideIn, slideOut };
};


