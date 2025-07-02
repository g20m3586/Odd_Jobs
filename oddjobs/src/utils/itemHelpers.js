// utils/itemHelpers.js
export function getImageUrl(filename) {
  if (!filename) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${filename}`
}
