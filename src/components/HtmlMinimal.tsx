import { useThree } from '@react-three/fiber'
import React, { forwardRef, ReactNode, useLayoutEffect, useRef } from 'react'
// @ts-ignore
import { createRoot, Root } from 'react-dom/client'

interface HtmlProps {
  portal?: React.MutableRefObject<HTMLElement>
  className?: string,
  name?: string,
  children?: ReactNode
}

const HtmlMinimal = forwardRef<HTMLDivElement, HtmlProps>(({ portal, className, children, name, ...props }, ref) => {
  const gl = useThree(state => state.gl)
  const group = useRef(null)
  const rootRef = useRef<Root | null>(null)

  const target = portal?.current != null ? portal.current : gl.domElement.parentNode

  useLayoutEffect(() => {
    if (!group.current || !target) return

    const el = document.createElement('div')
    const root = (rootRef.current = createRoot(el))

    target.appendChild(el)

    return () => {
      root.unmount()
      rootRef.current = null
      target.removeChild(el)
    }
  }, [target])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    root.render(
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  })

  return <group name={name} {...props} ref={group} />
})

export { HtmlMinimal }
