export const TransitionOverlay = ({ isTransitioning }) => {
  if (!isTransitioning) return null

  return (
    <div
      className="fixed inset-0 bg-white z-50 transition-opacity duration-400 ease-in-out"
      style={{
        opacity: isTransitioning ? 1 : 0,
        pointerEvents: isTransitioning ? "all" : "none",
      }}
    />
  )
}
