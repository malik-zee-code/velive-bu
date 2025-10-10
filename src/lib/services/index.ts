// services/index.ts - Export all services
export { default as userService } from './userService';
export { default as propertyService } from './propertyService';
export { default as blogService } from './blogService';
export { default as categoryService } from './categoryService';
export { default as locationService } from './locationService';
export { default as countryService } from './countryService';
export { default as settingsService } from './settingsService';
export { default as propertyImageService } from './propertyImageService';

// Export types
export type { User, LoginCredentials, RegisterData, AuthResponse } from './userService';
export type { Property, CreatePropertyData, PropertyStats } from './propertyService';
export type { PropertyImage, UpdatePropertyImageData } from './propertyImageService';
export type { Blog, CreateBlogData } from './blogService';
export type { Category, CreateCategoryData } from './categoryService';
export type { Location, CreateLocationData } from './locationService';
export type { Country, CreateCountryData } from './countryService';
export type { Setting, CreateSettingData } from './settingsService';

