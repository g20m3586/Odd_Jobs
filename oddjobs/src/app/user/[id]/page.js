import { supabase } from "@/lib/client"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { MapPin, Twitter, Linkedin } from "lucide-react"
import CopyProfileLinkButton from "@/components/CopyProfileLinkButton"

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
    .select("name, bio, location, avatar_url, twitter, linkedin, role, created_at, views")
    .eq("id", id)
    .single()

  if (error || !userProfile) return notFound()

  // Increment view count (fire & forget)
  supabase
    .from("profiles")
    .update({ views: (userProfile.views || 0) + 1 })
    .eq("id", id)
    .then(() => {})
    .catch(() => {})

  return (
    <main className="max-w-4xl mx-auto p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-xl">
      {/* Top Hero Section */}
      <section className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <img
          src={userProfile.avatar_url || "/default-avatar.jpg"}
          alt={`${userProfile.name}'s avatar`}
          className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-blue-600 dark:border-blue-400 object-cover shadow-md"
          loading="lazy"
        />

        <div className="text-center md:text-left flex-1 space-y-3">
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white">{userProfile.name}</h1>
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            {userProfile.role || "Member"}
          </p>

          {userProfile.location && (
            <p className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground text-sm">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              {userProfile.location}
            </p>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="mt-8 flex justify-center md:justify-start gap-8 flex-wrap">
        <div className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg px-6 py-3 font-semibold shadow-sm">
          Joined: <span className="font-normal">{new Date(userProfile.created_at).toLocaleDateString()}</span>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg px-6 py-3 font-semibold shadow-sm">
          Profile Views: <span className="font-normal">{userProfile.views || 0}</span>
        </div>
      </section>

      {/* Bio Section */}
      {userProfile.bio && (
        <section className="mt-10 max-w-3xl mx-auto text-gray-800 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
          {userProfile.bio}
        </section>
      )}

      {/* Social Buttons */}
      <section className="mt-12 flex justify-center md:justify-start gap-6">
        {userProfile.twitter && (
          <a
            href={`https://twitter.com/${userProfile.twitter.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg transition"
            aria-label="Twitter profile"
          >
            <Twitter className="w-6 h-6" />
            @{userProfile.twitter.replace("@", "")}
          </a>
        )}

        {userProfile.linkedin && (
          <a
            href={userProfile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg transition"
            aria-label="LinkedIn profile"
          >
            <Linkedin className="w-6 h-6" />
            LinkedIn
          </a>
        )}
      </section>

      {/* Copy Profile Link Button */}
      <section className="mt-14 flex justify-center">
        <CopyProfileLinkButton userId={id} />
      </section>
    </main>
  )
}
