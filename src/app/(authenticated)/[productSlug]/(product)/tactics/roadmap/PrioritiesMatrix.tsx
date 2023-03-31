import type { FC, ReactNode } from "react"

export type PrioritiesMatrixProps = {
  children: ReactNode
}

const PrioritiesMatrix: FC<PrioritiesMatrixProps> = ({ children }) => {
  return (
    <div className="relative h-full">
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}

export default PrioritiesMatrix
