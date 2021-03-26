import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

export function AdaptiveDpr({ pixelated }) {
  const gl = useThree((state) => state.gl)
  const current = useThree((state) => state.performance.current)
  const initialDpr = useThree((state) => state.viewport.initialDpr)
  const setDpr = useThree((state) => state.setDpr)
  // Restore initial pixelratio on unmount
  useEffect(
    () => () => {
      setDpr(initialDpr)
      if (pixelated) gl.domElement.style.imageRendering = 'auto'
    },
    [],
  )
  // Set adaptive pixelratio
  useEffect(() => {
    setDpr(current * initialDpr)
    if (pixelated) gl.domElement.style.imageRendering = current === 1 ? 'auto' : 'pixelated'
  }, [current])
  return null
}

export function AdaptiveEvents() {
  const get = useThree((state) => state.get)
  const current = useThree((state) => state.performance.current)
  useEffect(() => {
    const active = get().raycaster.active
    return () => (get().raycaster.active = active)
  }, [])
  useEffect(() => (get().raycaster.active = current === 1), [current])
  return null
}
