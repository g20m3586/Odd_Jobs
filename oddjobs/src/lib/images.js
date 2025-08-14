import { supabase } from './client';

export const uploadItemImage = async (file, userId) => {
  const ext = file.name.split('.').pop();
  const filePath = `public/${userId}-${Date.now()}.${ext}`;
  
  const { error } = await supabase.storage
    .from('item-images')
    .upload(filePath, file);
    
  if (error) throw error;
  
  return filePath; // Return full path
};

export const getItemImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  // Remove any existing bucket/path prefixes
  const cleanPath = path.replace(/^item-images\//, '')
                       .replace(/^public\//, '');
  
  const { data } = supabase.storage
    .from('item-images')
    .getPublicUrl(`public/${cleanPath}`);
  
  return data?.publicUrl || null;
};

export const deleteItemImage = async (path) => {
  if (!path) return;
  
  const cleanPath = path.replace(/^item-images\//, '')
                       .replace(/^public\//, '');
  
  await supabase.storage
    .from('item-images')
    .remove([`public/${cleanPath}`]);
};