export const getItemImageUrl = (path) => {
  if (!path) return null
  const { data } = supabase.storage.from("item-images").getPublicUrl(path)
  return data?.publicUrl
}