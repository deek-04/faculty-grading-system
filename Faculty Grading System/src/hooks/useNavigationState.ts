import { useEffect, useCallback } from 'react';
import { useNavigation, PreservedState } from '../contexts/NavigationContext';

/**
 * Custom hook for managing navigation state in components
 */
export function useNavigationState() {
  const navigation = useNavigation();

  // Helper to preserve component state
  const preserveComponentState = useCallback((
    key: keyof PreservedState, 
    data: any
  ) => {
    navigation.preserveState(key, data);
  }, [navigation]);

  // Helper to restore component state
  const restoreComponentState = useCallback((
    key: keyof PreservedState
  ) => {
    return navigation.getPreservedState(key);
  }, [navigation]);

  // Helper to mark unsaved changes
  const markUnsavedChanges = useCallback((hasChanges: boolean) => {
    navigation.setUnsavedChanges(hasChanges);
  }, [navigation]);

  // Helper for safe navigation with confirmation
  const safeNavigate = useCallback(async (
    route: string, 
    options?: { preserveState?: boolean; confirmMessage?: string }
  ) => {
    if (navigation.state.unsavedChanges && !options?.confirmMessage) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave this page?'
      );
      if (!confirmed) return false;
    }

    return navigation.navigateTo(route, { 
      skipConfirmation: true,
      ...options 
    });
  }, [navigation]);

  // Helper for safe back navigation
  const safeNavigateBack = useCallback(async (
    options?: { preserveState?: boolean; confirmMessage?: string }
  ) => {
    if (navigation.state.unsavedChanges && !options?.confirmMessage) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to go back?'
      );
      if (!confirmed) return false;
    }

    return navigation.navigateBack({ 
      skipConfirmation: true,
      ...options 
    });
  }, [navigation]);

  return {
    // Navigation state
    currentRoute: navigation.state.currentRoute,
    isNavigating: navigation.state.isNavigating,
    hasUnsavedChanges: navigation.state.unsavedChanges,
    breadcrumbs: navigation.generateBreadcrumbs(),
    
    // Navigation functions
    navigateTo: safeNavigate,
    navigateBack: safeNavigateBack,
    
    // State management
    preserveState: preserveComponentState,
    restoreState: restoreComponentState,
    markUnsavedChanges,
    clearState: navigation.clearPreservedState,
    
    // Raw navigation context (for advanced usage)
    navigation,
  };
}

/**
 * Hook specifically for grading interface state management
 */
export function useGradingNavigationState() {
  const { preserveState, restoreState, markUnsavedChanges } = useNavigationState();

  const preserveGradingState = useCallback((gradingData: {
    currentPaperIndex: number;
    currentPage: number;
    zoomLevel: number;
    questionMarks: Record<string, number>;
    timeSpent: number;
    sectionId?: string;
  }) => {
    preserveState('gradingInterface', gradingData);
  }, [preserveState]);

  const restoreGradingState = useCallback(() => {
    return restoreState('gradingInterface');
  }, [restoreState]);

  return {
    preserveGradingState,
    restoreGradingState,
    markUnsavedChanges,
  };
}

/**
 * Hook specifically for dashboard state management
 */
export function useDashboardNavigationState() {
  const { preserveState, restoreState } = useNavigationState();

  const preserveDashboardState = useCallback((dashboardData: {
    selectedSection: string;
    filterState: any;
    scrollPosition: number;
  }) => {
    preserveState('dashboard', dashboardData);
  }, [preserveState]);

  const restoreDashboardState = useCallback(() => {
    return restoreState('dashboard');
  }, [restoreState]);

  return {
    preserveDashboardState,
    restoreDashboardState,
  };
}

/**
 * Hook for handling browser navigation events
 */
export function useBrowserNavigation() {
  const navigation = useNavigation();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (navigation.state.unsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      if (navigation.state.unsavedChanges) {
        const confirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to go back?'
        );
        if (!confirmed) {
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', window.location.href);
          return;
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigation.state.unsavedChanges]);

  return {
    hasUnsavedChanges: navigation.state.unsavedChanges,
    setUnsavedChanges: navigation.setUnsavedChanges,
  };
}