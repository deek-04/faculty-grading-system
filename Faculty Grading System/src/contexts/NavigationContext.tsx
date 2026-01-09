import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// TypeScript Interfaces
export interface RouteInfo {
  path: string;
  title: string;
  parent?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbItem {
  label: string;
  route: string;
  isActive: boolean;
  icon?: React.ReactNode;
}

export interface NavigationOptions {
  preserveState?: boolean;
  confirmMessage?: string;
  skipConfirmation?: boolean;
}

export interface HistoryEntry {
  route: string;
  timestamp: Date;
  state?: Record<string, any>;
  scrollPosition?: { x: number; y: number };
}

export interface PreservedState {
  gradingInterface?: {
    currentPaperIndex: number;
    currentPage: number;
    zoomLevel: number;
    questionMarks: Record<string, number>;
    timeSpent: number;
    sectionId?: string;
  };
  dashboard?: {
    selectedSection: string;
    filterState: any;
    scrollPosition: number;
  };
  adminDashboard?: {
    activeTab: string;
    filterCriteria: any;
    selectedFaculty: string[];
  };
}

export interface NavigationState {
  currentRoute: string;
  routeHierarchy: RouteInfo[];
  navigationHistory: HistoryEntry[];
  unsavedChanges: boolean;
  preservedState: PreservedState;
  isNavigating: boolean;
}

export interface NavigationContextType {
  state: NavigationState;
  navigateBack: (options?: NavigationOptions) => Promise<boolean>;
  navigateTo: (route: string, options?: NavigationOptions) => Promise<boolean>;
  setUnsavedChanges: (hasChanges: boolean) => void;
  preserveState: (key: keyof PreservedState, data: any) => void;
  getPreservedState: (key: keyof PreservedState) => any;
  generateBreadcrumbs: () => BreadcrumbItem[];
  addToHistory: (route: string, state?: Record<string, any>) => void;
  clearPreservedState: (key?: keyof PreservedState) => void;
}

// Route Configuration
const ROUTE_CONFIG: Record<string, RouteInfo> = {
  '/': {
    path: '/',
    title: 'Login',
  },
  '/dashboard': {
    path: '/dashboard',
    title: 'Dashboard',
  },
  '/grading': {
    path: '/grading/:sectionId',
    title: 'Grading Interface',
    parent: '/dashboard',
  },
  '/admin': {
    path: '/admin',
    title: 'Admin Dashboard',
  },
};

// Action Types
type NavigationAction =
  | { type: 'SET_CURRENT_ROUTE'; payload: string }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'PRESERVE_STATE'; payload: { key: keyof PreservedState; data: any } }
  | { type: 'CLEAR_PRESERVED_STATE'; payload?: keyof PreservedState }
  | { type: 'ADD_TO_HISTORY'; payload: HistoryEntry }
  | { type: 'SET_NAVIGATING'; payload: boolean }
  | { type: 'LOAD_PRESERVED_STATE'; payload: PreservedState };

// Initial State
const initialState: NavigationState = {
  currentRoute: '/',
  routeHierarchy: [],
  navigationHistory: [],
  unsavedChanges: false,
  preservedState: {},
  isNavigating: false,
};

// Reducer
function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'SET_CURRENT_ROUTE':
      return {
        ...state,
        currentRoute: action.payload,
        routeHierarchy: buildRouteHierarchy(action.payload),
      };
    case 'SET_UNSAVED_CHANGES':
      return {
        ...state,
        unsavedChanges: action.payload,
      };
    case 'PRESERVE_STATE':
      const newPreservedState = {
        ...state.preservedState,
        [action.payload.key]: action.payload.data,
      };
      // Save to localStorage
      try {
        localStorage.setItem('navigation_preserved_state', JSON.stringify(newPreservedState));
      } catch (error) {
        console.warn('Failed to save navigation state to localStorage:', error);
      }
      return {
        ...state,
        preservedState: newPreservedState,
      };
    case 'CLEAR_PRESERVED_STATE':
      const clearedState = action.payload 
        ? { ...state.preservedState, [action.payload]: undefined }
        : {};
      try {
        localStorage.setItem('navigation_preserved_state', JSON.stringify(clearedState));
      } catch (error) {
        console.warn('Failed to clear navigation state from localStorage:', error);
      }
      return {
        ...state,
        preservedState: clearedState,
      };
    case 'ADD_TO_HISTORY':
      const newHistory = [...state.navigationHistory, action.payload].slice(-10); // Keep last 10 entries
      return {
        ...state,
        navigationHistory: newHistory,
      };
    case 'SET_NAVIGATING':
      return {
        ...state,
        isNavigating: action.payload,
      };
    case 'LOAD_PRESERVED_STATE':
      return {
        ...state,
        preservedState: action.payload,
      };
    default:
      return state;
  }
}

// Helper Functions
function buildRouteHierarchy(currentRoute: string): RouteInfo[] {
  const hierarchy: RouteInfo[] = [];
  let route = currentRoute;
  
  while (route) {
    const routeConfig = findRouteConfig(route);
    if (routeConfig) {
      hierarchy.unshift(routeConfig);
      route = routeConfig.parent || '';
    } else {
      break;
    }
  }
  
  return hierarchy;
}

function findRouteConfig(route: string): RouteInfo | undefined {
  // Direct match
  if (ROUTE_CONFIG[route]) {
    return ROUTE_CONFIG[route];
  }
  
  // Pattern match for dynamic routes
  for (const [pattern, config] of Object.entries(ROUTE_CONFIG)) {
    if (matchRoute(pattern, route)) {
      return config;
    }
  }
  
  return undefined;
}

function matchRoute(pattern: string, route: string): boolean {
  const patternParts = pattern.split('/');
  const routeParts = route.split('/');
  
  if (patternParts.length !== routeParts.length) {
    return false;
  }
  
  return patternParts.every((part, index) => {
    return part.startsWith(':') || part === routeParts[index];
  });
}

// Context
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Provider Component
interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [state, dispatch] = useReducer(navigationReducer, initialState);
  const location = useLocation();
  const navigate = useNavigate();

  // Load preserved state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('navigation_preserved_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_PRESERVED_STATE', payload: parsedState });
      }
    } catch (error) {
      console.warn('Failed to load navigation state from localStorage:', error);
    }
  }, []);

  // Update current route when location changes
  useEffect(() => {
    dispatch({ type: 'SET_CURRENT_ROUTE', payload: location.pathname });
    addToHistory(location.pathname);
  }, [location.pathname]);

  // Navigation Functions
  const navigateBack = async (options: NavigationOptions = {}): Promise<boolean> => {
    if (state.unsavedChanges && !options.skipConfirmation) {
      // This will be handled by the BackButton component with confirmation dialog
      return false;
    }

    dispatch({ type: 'SET_NAVIGATING', payload: true });

    try {
      // Get the previous route from history or use fallback
      const previousRoute = state.navigationHistory[state.navigationHistory.length - 2];
      const targetRoute = previousRoute?.route || '/dashboard';

      if (options.preserveState) {
        // State preservation will be handled by individual components
      }

      navigate(targetRoute);
      dispatch({ type: 'SET_NAVIGATING', payload: false });
      return true;
    } catch (error) {
      console.error('Navigation error:', error);
      dispatch({ type: 'SET_NAVIGATING', payload: false });
      return false;
    }
  };

  const navigateTo = async (route: string, options: NavigationOptions = {}): Promise<boolean> => {
    if (state.unsavedChanges && !options.skipConfirmation) {
      return false;
    }

    dispatch({ type: 'SET_NAVIGATING', payload: true });

    try {
      navigate(route);
      dispatch({ type: 'SET_NAVIGATING', payload: false });
      return true;
    } catch (error) {
      console.error('Navigation error:', error);
      dispatch({ type: 'SET_NAVIGATING', payload: false });
      return false;
    }
  };

  const setUnsavedChanges = (hasChanges: boolean) => {
    dispatch({ type: 'SET_UNSAVED_CHANGES', payload: hasChanges });
  };

  const preserveState = (key: keyof PreservedState, data: any) => {
    dispatch({ type: 'PRESERVE_STATE', payload: { key, data } });
  };

  const getPreservedState = (key: keyof PreservedState) => {
    return state.preservedState[key];
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    return state.routeHierarchy.map((route, index) => ({
      label: route.title,
      route: route.path,
      isActive: index === state.routeHierarchy.length - 1,
      icon: route.icon,
    }));
  };

  const addToHistory = (route: string, routeState?: Record<string, any>) => {
    const historyEntry: HistoryEntry = {
      route,
      timestamp: new Date(),
      state: routeState,
      scrollPosition: { x: window.scrollX, y: window.scrollY },
    };
    dispatch({ type: 'ADD_TO_HISTORY', payload: historyEntry });
  };

  const clearPreservedState = (key?: keyof PreservedState) => {
    dispatch({ type: 'CLEAR_PRESERVED_STATE', payload: key });
  };

  const contextValue: NavigationContextType = {
    state,
    navigateBack,
    navigateTo,
    setUnsavedChanges,
    preserveState,
    getPreservedState,
    generateBreadcrumbs,
    addToHistory,
    clearPreservedState,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

// Hook
export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}