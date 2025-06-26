"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/client"
import ProfileCard from "@/components/ProfileCard"
import { Input } from "@/components/ui/input"

export default function DirectoryPage() {
  const [profiles, setProfiles] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, role, location, bio, twitter, linkedin")
        .eq("is_public", true)
        .order("created_at", { ascending: false })

      if (!error) setProfiles(data)
    }

    fetchProfiles()
  }, [])

  const filtered = profiles.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.role?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Public Profiles</h1>

      <div className="mb-6 flex justify-center">
        <Input
          type="text"
          placeholder="Search by name, role, or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center">No matching profiles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((user) => (
            <ProfileCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  )
}
