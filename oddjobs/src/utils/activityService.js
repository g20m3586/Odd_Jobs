// utils/activityService.js
import { supabase } from "@/lib/client"

export const ActivityService = {
  async logActivity(userId, type, description, metadata = {}) {
    const { error } = await supabase
      .from('activity_log')
      .insert({
        user_id: userId,
        type,
        description,
        metadata,
        created_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error logging activity:', error)
      throw error
    }
  },

  async getRecentActivities(userId, limit = 5) {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching activities:', error)
      throw error
    }
    return data
  }
}