import { RouteInfo } from '../contexts/NavigationContext';
import { 
  Home, 
  BookOpen, 
  Settings, 
  Users, 
  FileText,
  BarChart3,
  Shield
} from 'lucide-react';

/**
 * Route configuration for the application
 * Defines the hierarchy and metadata for all routes
 */
export const ROUTE_CONFIG: Record<string, RouteInfo> = {
  '/': {
    path: '/',
    title: 'Login',
    icon: Home,
  },
  '/dashboard': {
    path: '/dashboard',
    title: 'Faculty Dashboard',
    icon: BookOpen,
  },
  '/grading/:sectionId': {
    path: '/grading/:sectionId',
    title: 'Grading Interface',
    parent: '/dashboard',
    icon: FileText,
  },
  '/admin': {
    path: '/admin',
    title: 'Admin Dashboard',
    icon: Shield,
  },
  '/admin/monitoring': {
    path: '/admin/monitoring',
    title: 'Faculty Monitoring',
    parent: '/admin',
    icon: BarChart3,
  },
  '/admin/users': {
    path: '/admin/users',
    title: 'User Management',
    parent: '/admin',
    icon: Users,
  },
  '/admin/settings': {
    path: '/admin/settings',
    title: 'System Settings',
    parent: '/admin',
    icon: Settings,
  },
};

/**
 * Get route configuration by path
 */
export function getRouteConfig(path: string): RouteInfo | undefined {
  // Direct match
  if (ROUTE_CONFIG[path]) {
    return ROUTE_CONFIG[path];
  }
  
  // Pattern match for dynamic routes
  for (const [pattern, config] of Object.entries(ROUTE_CONFIG)) {
    if (matchRoutePattern(pattern, path)) {
      return {
        ...config,
        path: path, // Use actual path instead of pattern
      };
    }
  }
  
  return undefined;
}

/**
 * Check if a route path matches a pattern
 */
export function matchRoutePattern(pattern: string, path: string): boolean {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  
  if (patternParts.length !== pathParts.length) {
    return false;
  }
  
  return patternParts.every((part, index) => {
    return part.startsWith(':') || part === pathParts[index];
  });
}

/**
 * Build route hierarchy for breadcrumbs
 */
export function buildRouteHierarchy(currentPath: string): RouteInfo[] {
  const hierarchy: RouteInfo[] = [];
  let path = currentPath;
  
  while (path) {
    const routeConfig = getRouteConfig(path);
    if (routeConfig) {
      hierarchy.unshift(routeConfig);
      path = routeConfig.parent || '';
    } else {
      break;
    }
  }
  
  return hierarchy;
}

/**
 * Get route title with dynamic parameters
 */
export function getRouteTitle(path: string, params?: Record<string, string>): string {
  const config = getRouteConfig(path);
  if (!config) return 'Unknown Page';
  
  let title = config.title;
  
  // Handle dynamic route titles
  if (path.includes('/grading/') && params?.sectionId) {
    title = `Grading - Section ${params.sectionId}`;
  }
  
  return title;
}

/**
 * Check if a route requires authentication
 */
export function requiresAuth(path: string): boolean {
  // All routes except login require authentication
  return path !== '/';
}

/**
 * Check if a route is an admin route
 */
export function isAdminRoute(path: string): boolean {
  return path.startsWith('/admin');
}

/**
 * Check if a route is a faculty route
 */
export function isFacultyRoute(path: string): boolean {
  return path.startsWith('/dashboard') || path.startsWith('/grading');
}

/**
 * Get the parent route for a given path
 */
export function getParentRoute(path: string): string | undefined {
  const config = getRouteConfig(path);
  return config?.parent;
}

/**
 * Get all child routes for a given path
 */
export function getChildRoutes(parentPath: string): RouteInfo[] {
  return Object.values(ROUTE_CONFIG).filter(
    config => config.parent === parentPath
  );
}

/**
 * Navigation utilities for common operations
 */
export const NavigationUtils = {
  getRouteConfig,
  matchRoutePattern,
  buildRouteHierarchy,
  getRouteTitle,
  requiresAuth,
  isAdminRoute,
  isFacultyRoute,
  getParentRoute,
  getChildRoutes,
};