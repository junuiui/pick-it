
const votePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] space-y-6">
      <h1 className="text-4xl font-bold">Vote</h1>
      <p className="text-muted-foreground">Create polls and vote in real-time.</p>

      <a
        href="/games/vote/create"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Create New Poll
      </a>
    </div>
  )
}

export default votePage;