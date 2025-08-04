import { supabase } from './client';

const VALID_CONDITIONS = ["new", "like_new", "good", "fair", "poor"];
const DEFAULT_CONDITION = "good";
const CATEGORIES = ["general", "electronics", "clothing", "books", "furniture", "vehicles", "property"];

export const getItemImageUrl = (path) => {
  if (!path) return null;
  
  // Handle full URLs
  if (path.startsWith('http')) return path;
  
  // Normalize path
  const cleanPath = path.replace(/^item-images\//, '').replace(/^public\//, '');
  
  try {
    const { data } = supabase
      .storage
      .from('item-images')
      .getPublicUrl(cleanPath);
    
    return data?.publicUrl || null;
  } catch (error) {
    console.error('Error generating image URL:', error);
    return null;
  }
};

export const validateImageFile = (file) => {
  if (!file) return { valid: false, error: 'No file provided' };
  
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPG, PNG, or WEBP.' };
  }
  
  // Check file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }
  
  return { valid: true };
};

export { VALID_CONDITIONS, DEFAULT_CONDITION, CATEGORIES };