import { drawCounts, ProgramsPerfs } from '../store'

export const countGeoDrawCalls = (programs: ProgramsPerfs) => {
  programs.forEach((program, _pkey) => {
    const { meshes } = program
    if (!meshes) {
      return
    }
    let drawCounts: drawCounts = {
      total: 0,
      type: 'Triangle',
      data: [],
    }
    Object.keys(meshes).forEach((key) => {
      const mesh: any = meshes[key]
      const { geometry, material } = mesh

      let index = geometry.index
      const position = geometry.attributes.position

      if (!position) return

      let rangeFactor = 1

      if (material.wireframe === true) {
        rangeFactor = 0
      }

      const dataCount = index !== null ? index.count : position.count
      const rangeStart = geometry.drawRange.start * rangeFactor
      const rangeCount = geometry.drawRange.count * rangeFactor
      const drawStart = rangeStart
      const drawEnd = Math.min(dataCount, rangeStart + rangeCount) - 1
      let countInstanceRatio = 1
      const instanceCount = mesh.count || 1
      let type = 'Triangle'
      let mostDrawCalls = 0
      if (mesh.isMesh) {
        if (material.wireframe === true) {
          type = 'Line'
          countInstanceRatio = countInstanceRatio / 2
        } else {
          type = 'Triangle'
          countInstanceRatio = countInstanceRatio / 3
        }
      } else if (mesh.isLine) {
        type = 'Line'
        if (mesh.isLineSegments) {
          countInstanceRatio = countInstanceRatio / 2
        } else if (mesh.isLineLoop) {
          countInstanceRatio = countInstanceRatio
        } else {
          countInstanceRatio = countInstanceRatio - 1
        }
      } else if (mesh.isPoints) {
        type = 'Point'
        countInstanceRatio = countInstanceRatio
      } else if (mesh.isSprite) {
        type = 'Triangle'
        countInstanceRatio = countInstanceRatio / 3
      }

      const drawCount = Math.round(Math.max(0, drawEnd - drawStart + 1) * (countInstanceRatio * instanceCount))

      if (drawCount > mostDrawCalls) {
        mostDrawCalls = drawCount
        drawCounts.type = type
      }
      drawCounts.total += drawCount
      drawCounts.data.push({ drawCount, type })
      mesh.userData.drawCount = {
        type,
        count: drawCount,
      }
    })
    program.drawCounts = drawCounts
  })
}
