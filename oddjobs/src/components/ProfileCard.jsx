import Link from "next/link"
import { MapPin, Twitter, Linkedin } from "lucide-react"

export default function ProfileCard({ user }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl shadow p-4 space-y-3 w-full max-w-xs">
      <div className="flex flex-col items-center text-center">
        <img
          src={user.avatar_url || "/default-avatar.jpg"}
          alt={user.name}
          className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 mb-2"
        />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {user.name}
        </h3>
        <p className="text-sm text-muted-foreground capitalize">
          {user.role || "User"}
        </p>
      </div>

      {user.location && (
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <MapPin className="w-4 h-4" /> {user.location}
        </p>
      )}

      {user.bio && (
        <p className="text-sm text-zinc-700 dark:text-gray-300 mt-2 line-clamp-3">
          {user.bio}
        </p>
      )}

      <div className="flex justify-center gap-3 mt-3">
        {user.twitter && (
          <a
            href={`https://twitter.com/${user.twitter.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600"
          >
            <Twitter className="w-4 h-4" />
          </a>
        )}
        {user.linkedin && (
          <a
            href={user.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:text-blue-800"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        )}
      </div>

      <div className="pt-3">
        <Link
          href={`/user/${user.id}`}
          className="text-sm text-primary hover:underline"
        >
          View Profile
        </Link>
      </div>
    </div>
  )
}
