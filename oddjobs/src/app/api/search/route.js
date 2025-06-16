export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const location = searchParams.get('location')
  
    let supabaseQuery = supabase
      .from('jobs')
      .select(`
        id, title, price, description,
        business:profiles(name, avatar_url)
      `)
  
    if (query) {
      supabaseQuery = supabaseQuery
        .textSearch('search_vector', query, {
          type: 'websearch',
          config: 'english'
        })
    }
  
    if (location) {
      supabaseQuery = supabaseQuery
        .within('location', '10km', location.coordinates)
    }
  
    const { data, error } = await supabaseQuery
  
    return NextResponse.json(data)
  }