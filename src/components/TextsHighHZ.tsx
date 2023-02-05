import { FC, memo, Suspense, useRef } from 'react'
import { matriceCount, matriceWorldCount } from './PerfHeadless'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { getPerf } from '..'
import { colorsGraph } from './Perf'
import * as THREE from 'three'
import { customData, PerfUIProps } from '../typings'
import { useEvent } from '@utsubo/events'

interface TextHighHZProps {
  metric?: string
  colorBlind?: boolean
  isPerf?: boolean
  hasInstance?: boolean
  isMemory?: boolean
  isShadersInfo?: boolean
  fontSize: number
  round: number
  color?: string
  offsetX: number
  offsetY?: number
  customData?: customData
  minimal?: boolean
}

const TextHighHZ: FC<TextHighHZProps> = memo(
  ({
    isPerf,
    color,
    colorBlind,
    customData,
    isMemory,
    isShadersInfo,
    metric,
    fontSize,
    offsetY = 0,
    offsetX,
    round,
    hasInstance,
  }) => {
    const { width: w, height: h } = useThree((s) => s.viewport)
    const fpsRef = useRef<any>(null)
    const fpsInstanceRef = useRef<any>(null)

    useEvent('log', function updateR3FPerfText([log, gl]) {
      if (!log || !fpsRef.current) return

      if (customData) {
        fpsRef.current.text = (Math.round(getPerf().customData * Math.pow(10, round)) / Math.pow(10, round)).toFixed(
          round
        )
      }

      if (!metric) return

      let info = log[metric]
      if (isShadersInfo) {
        info = gl.info.programs?.length
      } else if (metric === 'matriceCount') {
        info = matriceCount.value
      } else if (!isPerf && gl.info.render) {
        const infos: any = isMemory ? gl.info.memory : gl.info.render
        info = infos[metric]
      }

      if (metric === 'fps') {
        fpsRef.current.color = getPerf().overclockingFps
          ? colorsGraph(colorBlind).overClock.toString()
          : `rgb(${colorsGraph(colorBlind).fps.toString()})`
      }
      fpsRef.current.text = (Math.round(info * Math.pow(10, round)) / Math.pow(10, round)).toFixed(round)

      if (hasInstance) {
        const infosInstance: any = gl.info.instance

        if (typeof infosInstance === 'undefined' && metric !== 'matriceCount') {
          return
        }

        let infoInstance
        if (metric === 'matriceCount') {
          infoInstance = matriceWorldCount.value
        } else {
          infoInstance = infosInstance[metric]
        }

        if (infoInstance > 0) {
          fpsRef.current.fontSize = fontSize / 1.15
          fpsInstanceRef.current.fontSize = info > 0 ? fontSize / 1.4 : fontSize

          fpsRef.current.position.y = h / 2 - offsetY - fontSize / 1.9
          fpsInstanceRef.current.text =
            ' ±	' + (Math.round(infoInstance * Math.pow(10, round)) / Math.pow(10, round)).toFixed(round)
        } else {
          if (fpsInstanceRef.current.text) fpsInstanceRef.current.text = ''

          fpsRef.current.position.y = h / 2 - offsetY - fontSize
          fpsRef.current.fontSize = fontSize
        }
      }
      matriceCount.value -= 1
      fpsRef.current.updateMatrix()
      fpsRef.current.matrixWorld.copy(fpsRef.current.matrix)
    })
    return (
      <Suspense fallback={null}>
        <Text
          textAlign="justify"
          matrixAutoUpdate={false}
          ref={fpsRef}
          fontSize={fontSize}
          position={[-w / 2 + offsetX + fontSize, h / 2 - offsetY - fontSize, 0]}
          color={color}
          characters="0123456789"
          onUpdate={(self) => {
            self.updateMatrix()
            matriceCount.value -= 1
            self.matrixWorld.copy(self.matrix)
          }}>
          <meshBasicMaterial blending={THREE.NormalBlending} />0
        </Text>
        {hasInstance && (
          <Text
            textAlign="justify"
            matrixAutoUpdate={false}
            ref={fpsInstanceRef}
            fontSize={8}
            position={[-w / 2 + offsetX + fontSize, h / 2 - offsetY - fontSize * 1.15, 0]}
            color={'lightgrey'}
            characters="0123456789"
            onUpdate={(self) => {
              self.updateMatrix()
              matriceCount.value -= 1
              self.matrixWorld.copy(self.matrix)
            }}>
            <meshBasicMaterial blending={THREE.NormalBlending} />
          </Text>
        )}
      </Suspense>
    )
  }
)

export const TextsHighHZ: FC<PerfUIProps> = ({ colorBlind, customData, minimal, matrixUpdate }) => {
  // const [supportMemory] = useState(window.performance.memory)
  // const supportMemory = false

  const fontSize: number = 14
  return (
    <>
      <TextHighHZ
        colorBlind={colorBlind}
        color={`rgb(${colorsGraph(colorBlind).fps.toString()})`}
        isPerf
        metric="fps"
        fontSize={fontSize}
        offsetX={140}
        round={0}
      />
      <TextHighHZ
        color={`rgb(${colorsGraph(colorBlind).cpu.toString()})`}
        isPerf
        metric="cpu"
        fontSize={fontSize}
        offsetX={72}
        round={3}
      />
      {/* <TextHighHZ color={supportMemory ? `rgb(${colorsGraph(colorBlind).cpu.toString()})` : ''} isPerf metric='maxMemory' fontSize={8} offsetX={112} offsetY={10} round={0} /> */}
      <TextHighHZ
        color={`rgb(${colorsGraph(colorBlind).gpu.toString()})`}
        isPerf
        metric="gpu"
        fontSize={fontSize}
        offsetX={10}
        round={3}
      />
      {!minimal ? (
        <>
          <TextHighHZ metric="calls" fontSize={fontSize} offsetX={200} round={0} hasInstance />
          <TextHighHZ metric="triangles" fontSize={fontSize} offsetX={260} round={0} hasInstance />
          <TextHighHZ isMemory metric="geometries" fontSize={fontSize} offsetY={30} offsetX={0} round={0} />
          <TextHighHZ isMemory metric="textures" fontSize={fontSize} offsetY={30} offsetX={80} round={0} />
          <TextHighHZ isShadersInfo metric="programs" fontSize={fontSize} offsetY={30} offsetX={140} round={0} />
          <TextHighHZ metric="lines" fontSize={fontSize} offsetY={30} offsetX={200} round={0} hasInstance />
          <TextHighHZ metric="points" fontSize={fontSize} offsetY={30} offsetX={260} round={0} hasInstance />
          {matrixUpdate && (
            <TextHighHZ
              isPerf
              metric="matriceCount"
              fontSize={fontSize}
              offsetY={30}
              offsetX={320}
              round={0}
              hasInstance
            />
          )}
        </>
      ) : null}

      {customData && (
        <TextHighHZ
          color={`rgb(${colorsGraph(colorBlind).custom.toString()})`}
          customData={customData}
          fontSize={fontSize}
          offsetY={0}
          offsetX={minimal ? 200 : 320}
          round={customData.round || 2}
        />
      )}
    </>
  )
}
