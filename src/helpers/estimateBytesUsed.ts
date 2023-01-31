import { BufferGeometry } from "three"

/**
 * @param {Array<BufferGeometry>} geometry
 * @return {number}
 */
export function estimateBytesUsed(geometry: BufferGeometry): number {
    // Return the estimated memory used by this geometry in bytes
    // Calculate using itemSize, count, and BYTES_PER_ELEMENT to account
    // for InterleavedBufferAttributes.
    let mem = 0
    for (let name in geometry.attributes) {
      const attr = geometry.getAttribute(name)
      mem += attr.count * attr.itemSize * (attr.array as any).BYTES_PER_ELEMENT
    }
  
    const indices = geometry.getIndex()
    mem += indices ? indices.count * indices.itemSize * (indices.array as any).BYTES_PER_ELEMENT : 0
    return mem
}