import React from 'react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

// Deterministic hash to generate reproducible QR-like matrix grid for ticket validation
function generateMatrix(text: string, size = 25): boolean[][] {
  const matrix: boolean[][] = Array(size)
    .fill(false)
    .map(() => Array(size).fill(false));

  // Finder pattern helper (7x7 corners)
  const addFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = true;
        } else {
          matrix[startY + r][startX + c] = false;
        }
      }
    }
  };

  // Top-left, top-right, bottom-left finders
  addFinder(0, 0);
  addFinder(size - 7, 0);
  addFinder(0, size - 7);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Seed deterministic pseudorandom data based on input string
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder pattern zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      const pseudo = Math.sin(hash + r * 31 + c * 17) * 10000;
      matrix[r][c] = pseudo - Math.floor(pseudo) > 0.48;
    }
  }

  return matrix;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 160, className = '' }) => {
  const gridSize = 25;
  const matrix = React.useMemo(() => generateMatrix(value, gridSize), [value]);
  const cellSize = size / gridSize;

  return (
    <div className={`inline-block p-3 bg-white rounded-xl shadow-lg ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={size} height={size} fill="#ffffff" />
        {matrix.map((row, r) =>
          row.map((filled, c) => {
            if (!filled) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize + 0.2}
                height={cellSize + 0.2}
                fill="#0f172a"
              />
            );
          })
        )}
      </svg>
    </div>
  );
};
