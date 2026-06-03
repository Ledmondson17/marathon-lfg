export default function AboutPage() {
  return (
    <main className="min-h-screen bg-brand-bg px-4 py-20">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <p className="text-brand-accent text-xs font-semibold uppercase tracking-widest mb-4">
          About Shell Searcher
        </p>
        <h1 className="text-4xl font-bold text-brand-text leading-tight mb-16">
          Why this site exists.
        </h1>

        {/* Mission blurb */}
        <div className="space-y-8 text-brand-text text-lg leading-relaxed">
          <p>
            Playing with like-minded players can maximize your potential and skills.
            Video games are like sports — teaming up with players that share your same
            playstyle, in-game ideologies, or playstyles that complement yours can help
            you improve your game sense, technique, decision-making, communication,
            and overall knowledge of the game.
          </p>
          <p>
            Finding similar like-minded players can be a daunting challenge, and finding
            a consistent team to fellowship, play, and grow with can be even harder —
            which is why I created this site.
          </p>
          <p className="text-brand-accent font-semibold text-xl">
            Being the best player you can be shouldn't be a lonely road. Run together.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-brand-border mt-16 pt-10">
          <p className="text-brand-muted text-sm">
            Shell Searcher is an independent fan-made site and is not affiliated with
            Bungie, Inc.
          </p>
        </div>

      </div>
    </main>
  )
}
