function Rule({ className = '' }: { className?: string }) {
  return <hr className={`border-t border-line ${className}`} />
}

export default Rule