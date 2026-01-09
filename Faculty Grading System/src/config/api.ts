// API Configuration
export const API_CONFIG = {
  BASE_URL: '/api', // Use relative path for all-in-one deployment
  ENDPOINTS: {
    FACULTY_ASSIGNMENTS: (employeeId: string) => `/api/faculty/${employeeId}/assignments`,
    HEALTH: '/health',
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};