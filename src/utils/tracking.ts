// Databuddy tracking utility functions
declare global {
  interface Window {
    databuddy?: {
      track: (eventName: string, properties?: any) => Promise<void>;
    };
    db?: {
      track: (eventName: string, properties?: any) => Promise<void>;
    };
  }
}

export function isTrackerAvailable(): boolean {
  return typeof window !== 'undefined' && (!!window.databuddy || !!window.db);
}

/**
 * Get the Databuddy tracker instance
 */
export function getTracker(): any | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.databuddy || null;
}

/**
 * Type-safe track function
 */
export const track = async (
  eventName: string,
  properties?: any
): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Try window.db first (shorthand), then window.databuddy
  const tracker = window.db?.track || window.databuddy?.track;
  if (!tracker) {
    return;
  }
  
  try {
    await tracker(eventName, properties);
  } catch (_error) {
    // Silently fail if tracking fails
  }
};

/**
 * Track CTA button clicks
 */
export const trackCTAClick = async (ctaType: string, url?: string) => {
  await track('cta_click', {
    cta_type: ctaType,
    url: url,
    timestamp: new Date().toISOString(),
    page: window.location.pathname
  });
};

/**
 * Track email clicks
 */
export const trackEmailClick = async (email: string) => {
  await track('email_click', {
    email: email,
    timestamp: new Date().toISOString(),
    page: window.location.pathname
  });
};
