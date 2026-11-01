import { memo } from 'react';
import type { Grid, Palette } from './data';

type Props = {
  grid: Grid;
  palette: Palette;
  px?: number;
  flip?: boolean;
  rows?: number; // render only the first N rows (e.g. a portrait crop)
  className?: string;
};

// Renders a string grid as crisp SVG rects, merging horizontal runs of one colour.
export const PixelSprite = memo(function PixelSprite({ grid, palette, px = 3, flip, rows, className }: Props) {
  const lines = rows ? grid.slice(0, rows) : grid;
  const w = lines[0].length;
  const h = lines.length;
  const rects: JSX.Element[] = [];

  lines.forEach((line, y) => {
    let x = 0;
    while (x < w) {
      const ch = line[x];
      let run = 1;
      while (x + run < w && line[x + run] === ch) run++;
      const fill = palette[ch];
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={run} height={1} fill={fill} />);
      x += run;
    }
  });

  return (
    <svg
      className={`pixelated ${className ?? ''}`}
      width={w * px}
      height={h * px}
      viewBox={`0 0 ${w} ${h}`}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden
    >
      {rects}
    </svg>
  );
});
