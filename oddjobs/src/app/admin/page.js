"use client"
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

export default function AdminPage() {
  const [reports, setReports] = useState([])

  useEffect(() => {
    const fetchReports = async () => {
      const { data } = await supabase.from('reported_items').select('*')
      setReports(data)
    }
    fetchReports()
  }, [])

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <DataTable columns={columns} data={reports} />
    </div>
  )
}