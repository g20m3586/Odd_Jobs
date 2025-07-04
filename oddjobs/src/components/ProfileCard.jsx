"use client"

import Link from "next/link"
import { MapPin, Twitter, Linkedin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ProfileCard({ user }) {
  return (
    <div className="w-full max-w-sm mx-auto bg-background border rounded-xl shadow-md dark:border-zinc-800 p-5 space-y-4 transition hover:shadow-lg">
      {/* Avatar */}
      <div className="flex flex-col items-center text-center">
        <div className="relative group">
          <img
            src={user.avatar_url || "/default-avatar.jpg"}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 group-hover:scale-105 transition"
          />
        </div>

        <h3 className="text-xl font-semibold mt-2 text-zinc-900 dark:text-white">
          {user.name || "Unnamed"}
        </h3>
        <p className="text-sm text-muted-foreground capitalize">
          {user.role || "User"}
        </p>
      </div>

      {/* Location */}
      {user.location && (
        <div className="flex justify-center">
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            <MapPin className="w-4 h-4 mr-1 inline-block" />
            {user.location}
          </Badge>
        </div>
      )}

      {/* Bio */}
      {user.bio && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-muted-foreground line-clamp-3 text-center">
                {user.bio}
              </p>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{user.bio}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Socials */}
      <div className="flex justify-center gap-4 mt-2">
        {user.twitter && (
          <a
            href={`https://twitter.com/${user.twitter.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:scale-110 transition"
          >
            <Twitter className="w-5 h-5" />
          </a>
        )}
        {user.linkedin && (
          <a
            href={user.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:scale-110 transition"
          >
            <Linkedin className="w-5 h-5" />
          </a>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Link href={`/user/${user.id}`}>
          <Button size="sm" variant="outline">
            View Full Profile
          </Button>
        </Link>
      </div>
    </div>
  )
}
