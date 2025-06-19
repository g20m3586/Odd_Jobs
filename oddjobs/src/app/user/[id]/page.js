// ✅ Updated Public Profile Page with all enhancements
import { supabase } from "@/lib/supabase/client"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { ExternalLink, MapPin, Twitter, Linkedin } from "lucide-react"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, bio")
    .eq("id", params.id)
    .single()

  return {
    title: `${profile?.name || "User"} | Public Profile`,
    description: profile?.bio || "View user public profile."
  }
}

export default async function PublicProfilePage({ params }) {
  const { id } = params

  const { data: userProfile, error } = await supabase
    .from("profiles")
    .select("name, bio, location, avatar_url, twitter, linkedin, role, created_at")
    .eq("id", id)
    .single()

  if (error || !userProfile) return notFound()

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 text-center bg-white dark:bg-zinc-900 shadow rounded-xl">
      <img
        src={userProfile.avatar_url || "/default-avatar.png"}
        alt={userProfile.name}
        className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-blue-500"
      />
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{userProfile.name}</h1>
      <p className="text-muted-foreground text-sm">
        {userProfile.role} • Joined {new Date(userProfile.created_at).toLocaleDateString()}
      </p>

      {userProfile.location && (
        <p className="text-sm text-muted-foreground flex justify-center items-center gap-1">
          <MapPin className="w-4 h-4" /> {userProfile.location}
        </p>
      )}

      {userProfile.bio && (
        <p className="mt-4 text-sm text-gray-800 dark:text-gray-200 max-w-xl mx-auto">
          {userProfile.bio}
        </p>
      )}

      <div className="flex justify-center gap-4 mt-4">
        {userProfile.twitter && (
          <a
            href={`https://twitter.com/${userProfile.twitter.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
          >
            <Twitter className="w-4 h-4" /> Twitter
          </a>
        )}

        {userProfile.linkedin && (
          <a
            href={userProfile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <Linkedin className="w-4 h-4" /> LinkedIn
          </a>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_SITE_URL}/user/${id}`)}
          className="text-sm text-muted-foreground hover:underline flex items-center justify-center gap-1"
        >
          <ExternalLink className="w-4 h-4" /> Copy profile link
        </button>
      </div>
    </div>
  )
}
