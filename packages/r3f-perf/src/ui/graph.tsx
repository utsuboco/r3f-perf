import React, { FC, HTMLAttributes, useEffect, useRef, useState } from 'react';
import { GiPauseButton } from '@react-icons/all-files/gi/GiPauseButton';
import { raf } from 'rafz';
import { usePerfStore } from '../headless';
import { Graph, Graphpc } from '../styles';

export interface graphData {
  pointsX: number[];
  pointsY: number[];
  maxVal: number;
  element: string;
}

interface PerfUIProps extends HTMLAttributes<HTMLDivElement> {
  perfContainerRef: any;
  colorBlind?: boolean;
  trackCPU?: boolean;
  trackGPU?: boolean;
}
const ChartCurve = ({ cg, canvas, colorBlind, trackCPU, trackGPU }: any) => {
  // Create a viewport. Units are in pixels.
  const viewport = {
    x: 0,
    y: 0,
    width: cg.canvas.width,
    height: cg.canvas.height,
  };
  const coords = cg.coordinate.cartesian(
    cg.scale.linear([0, 1], [0, viewport.width - 4]),
    cg.scale.linear([0, 1], [10, viewport.height - 4])
  );

  const toPoints = (element: string, factor: number = 1) => {
    let maxVal = 0;
    let pointsX = [];
    let pointsY = [];
    const chart = usePerfStore.getState().chart.data[element];
    if (!chart || chart.length === 0) {
      return {
        pointsX: [0],
        pointsY: [0],
      };
    }
    let len = chart.length;
    for (let i = 0; i < len; i++) {
      let id = (usePerfStore.getState().chart.circularId + i + 1) % len;
      if (chart[id] !== undefined) {
        if (chart[id] > maxVal) {
          maxVal = chart[id] * factor;
        }

        pointsX.push(i / (len - 1));
        pointsY.push((Math.min(100, chart[id]) * factor) / 100);
      }
    }
    const graph: graphData = {
      pointsX,
      pointsY,
      maxVal,
      element,
    };
    return graph;
  };
  raf(() => {
    const graphs: any = [toPoints('fps'), toPoints('cpu')];
    if (trackGPU) {
      graphs.push(toPoints('gpu'));
    }
    const fps = graphs[0];
    const xs = [];
    const ys = [];

    for (let x = 0; x <= 1; x += 0.001) {
      xs.push(x);
      ys.push(0.5 + 0.25 * Math.sin(x * 2 * Math.PI));
    }

    const arrData = [
      cg.lineStrip(fps.pointsX, fps.pointsY, {
        colors: colorBlind
          ? [100 / 255, 143 / 255, 255 / 255, 1]
          : [238 / 255, 38 / 255, 110 / 255, 1],
        widths: 1.5,
      }),
    ];

    if (trackCPU) {
      const cpu = graphs[1];
      cg.lineStrip(cpu.pointsX, cpu.pointsY, {
        colors: colorBlind
          ? [254 / 255, 254 / 255, 98 / 255, 1]
          : [66 / 255, 226 / 255, 46 / 255, 1],
        widths: 1.5,
      });
    }

    if (trackGPU) {
      const gpu = graphs[2];
      arrData.push(
        cg.lineStrip(gpu.pointsX, gpu.pointsY, {
          colors: colorBlind
            ? [254 / 255, 254 / 255, 255 / 255, 1]
            : [253 / 255, 151 / 255, 31 / 255, 1],
          widths: 1.5,
        })
      );
    }
    cg.clear([0.141, 0.141, 0.141, 1]);
    cg.render(coords, viewport, arrData);

    cg.copyTo(viewport, canvas.current);
    return true;
  });

  return null;
};

export const ChartUI: FC<PerfUIProps> = ({
  perfContainerRef,
  colorBlind,
  trackCPU,
  trackGPU,
}) => {
  const canvas = useRef<any>(undefined);
  const [cg, setcg]: any = useState(null);
  useEffect(() => {
    if (canvas.current) {
      import('candygraph').then((module) => {
        // Do something with the module.
        const CandyGraph = module.CandyGraph;
        const cg = new CandyGraph(canvas.current);
        const { width } = perfContainerRef.current.getBoundingClientRect();
        cg.canvas.width = width;
        cg.canvas.height = 100;
        setcg(cg);
      });

      // cg.copyTo(viewport, canvas.current);
    }
  }, [canvas.current, perfContainerRef.current]);

  const paused = usePerfStore((state) => state.paused);
  return (
    <Graph
      style={{
        // width: trackCPU ? 'auto' : '310px',
        display: trackCPU ? 'table' : 'flex',
      }}
    >
      <canvas
        ref={canvas}
        style={{
          width: `${cg ? cg.canvas.width : 0}px`,
          height: `${cg ? cg.canvas.height : 0}px`,
          marginBottom: `-42px`,
          position: 'relative',
        }}
      />
      {!paused && cg && (
        <ChartCurve
          colorBlind={colorBlind}
          trackCPU={trackCPU}
          trackGPU={trackGPU}
          cg={cg}
          canvas={canvas}
        />
      )}
      {paused && (
        <Graphpc>
          <GiPauseButton /> PAUSED
        </Graphpc>
      )}
    </Graph>
  );
};
