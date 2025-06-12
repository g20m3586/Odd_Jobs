import { Button } from "@/components/ui/button"

export default function ActionCard({ title, description, href }) {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm dark:border-gray-700">
      <h3 className="font-medium text-lg text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Button asChild>
        <a href={href}>Go</a>
      </Button>
    </div>
  )
}
