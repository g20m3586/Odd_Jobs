"use client"
import { useState } from 'react'
import { supabase } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'

export default function ReviewForm({ jobId, revieweeId }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('reviews').insert({
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      job_id: jobId,
      rating,
      comment
    })
    if (!error) alert('Review submitted!')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {[1,2,3,4,5].map((star) => (
          <Star 
            key={star}
            fill={star <= rating ? "gold" : "transparent"}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
      <textarea 
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
      />
      <Button onClick={handleSubmit}>Submit Review</Button>
    </div>
  )
}