import { useState, useCallback, useMemo, useRef } from 'react';
import { HockeyRinkSVG } from './HockeyRinkSVG';
import {
  type MeasurementPoint,
  getTemplate,
  getHeatMapColor,
  RINK_VIEWBOX
} from './rink-templates';
import { formatDepth } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface InteractiveRinkDiagramProps {
  templateName: '25-point' | '35-point' | '47-point' | 'custom';
  customPoints?: MeasurementPoint[];
  measurements: Record<string, number>; // { point_id: depth_mm }
  onPointClick?: (point: MeasurementPoint) => void;
  selectedPointId?: string | null;
  showHeatMap?: boolean;
  readOnly?: boolean;
  className?: string;
}

interface PointMarkerProps {
  point: MeasurementPoint;
  measurement?: number;
  isSelected: boolean;
  isCompleted: boolean;
  onClick: () => void;
  showHeatMap: boolean;
  readOnly: boolean;
}

function PointMarker({
  point,
  measurement,
  isSelected,
  isCompleted,
  onClick,
  showHeatMap,
  readOnly,
}: PointMarkerProps) {
  // Determine point color
  const getFillColor = () => {
    if (showHeatMap && measurement !== undefined) {
      return getHeatMapColor(measurement);
    }
    if (isCompleted) {
      return '#69BE28'; // Action Green
    }
    if (isSelected) {
      return '#002244'; // Navy
    }
    return '#A5ACAF'; // Wolf Grey (pending)
  };

  const getStrokeColor = () => {
    if (isSelected) return '#002244';
    if (isCompleted) return '#69BE28';
    return '#A5ACAF';
  };

  return (
    <g
      className={cn(
        'cursor-pointer transition-transform duration-150',
        !readOnly && 'hover:scale-125'
      )}
      onClick={readOnly ? undefined : onClick}
      role={readOnly ? undefined : 'button'}
      tabIndex={readOnly ? undefined : 0}
      onKeyDown={readOnly ? undefined : (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Point ${point.order}${measurement !== undefined ? `, depth: ${formatDepth(measurement)}` : ', not measured'}`}
    >
      {/* Outer ring for selected state */}
      {isSelected && (
        <circle
          cx={point.x}
          cy={point.y}
          r="4"
          fill="none"
          stroke="#002244"
          strokeWidth="0.5"
          className="animate-pulse"
        />
      )}

      {/* Main point circle */}
      <circle
        cx={point.x}
        cy={point.y}
        r={isSelected ? 3 : 2.5}
        fill={getFillColor()}
        stroke={getStrokeColor()}
        strokeWidth="0.5"
      />

      {/* Point number */}
      <text
        x={point.x}
        y={point.y + 0.8}
        fontSize="2"
        fill="white"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontWeight="bold"
        style={{ pointerEvents: 'none' }}
      >
        {point.order}
      </text>

      {/* Measurement value tooltip (shown when completed and not in heat map mode) */}
      {isCompleted && measurement !== undefined && !showHeatMap && (
        <g>
          <rect
            x={point.x + 3}
            y={point.y - 3}
            width="12"
            height="5"
            rx="1"
            fill="white"
            stroke="#A5ACAF"
            strokeWidth="0.3"
          />
          <text
            x={point.x + 9}
            y={point.y}
            fontSize="2.5"
            fill="#002244"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            {formatDepth(measurement)}
          </text>
        </g>
      )}
    </g>
  );
}

export function InteractiveRinkDiagram({
  templateName,
  customPoints,
  measurements,
  onPointClick,
  selectedPointId = null,
  showHeatMap = false,
  readOnly = false,
  className,
}: InteractiveRinkDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: RINK_VIEWBOX.width, height: RINK_VIEWBOX.height });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Get measurement points based on template
  const points = useMemo(() => {
    if (templateName === 'custom' && customPoints) {
      return customPoints;
    }
    return getTemplate(templateName);
  }, [templateName, customPoints]);

  // Calculate completion stats
  const stats = useMemo(() => {
    const total = points.length;
    const completed = points.filter(p => measurements[p.id] !== undefined).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [points, measurements]);

  // Handle point click
  const handlePointClick = useCallback((point: MeasurementPoint) => {
    if (onPointClick && !readOnly) {
      onPointClick(point);
    }
  }, [onPointClick, readOnly]);

  // Touch/mouse handlers for pan/zoom (mobile support)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'touch' && e.isPrimary) {
      setIsPanning(true);
      setStartPan({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning) return;

    const dx = e.clientX - startPan.x;
    const dy = e.clientY - startPan.y;

    setViewBox(prev => ({
      ...prev,
      x: Math.max(0, Math.min(prev.x - dx * 0.1, RINK_VIEWBOX.width - prev.width)),
      y: Math.max(0, Math.min(prev.y - dy * 0.1, RINK_VIEWBOX.height - prev.height)),
    }));

    setStartPan({ x: e.clientX, y: e.clientY });
  }, [isPanning, startPan]);

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;

    setViewBox(prev => {
      const newWidth = Math.max(50, Math.min(RINK_VIEWBOX.width, prev.width * zoomFactor));
      const newHeight = Math.max(21.25, Math.min(RINK_VIEWBOX.height, prev.height * zoomFactor));

      // Keep zoom centered
      const dx = (prev.width - newWidth) / 2;
      const dy = (prev.height - newHeight) / 2;

      return {
        x: Math.max(0, Math.min(prev.x + dx, RINK_VIEWBOX.width - newWidth)),
        y: Math.max(0, Math.min(prev.y + dy, RINK_VIEWBOX.height - newHeight)),
        width: newWidth,
        height: newHeight,
      };
    });
  }, []);

  // Reset zoom
  const resetZoom = useCallback(() => {
    setViewBox({ x: 0, y: 0, width: RINK_VIEWBOX.width, height: RINK_VIEWBOX.height });
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* Progress bar */}
      <div className="mb-3 flex items-center justify-between p-3 bg-wolf-50 rounded-lg">
        <span className="text-sm text-wolf-600">Progress</span>
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 bg-wolf-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-action rounded-full transition-all duration-300"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-navy">
            {stats.completed}/{stats.total} points
          </span>
        </div>
      </div>

      {/* SVG Container */}
      <div
        className="relative bg-white rounded-lg border-2 border-wolf-200 overflow-hidden touch-none"
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          className="w-full h-auto"
          style={{ aspectRatio: `${RINK_VIEWBOX.width}/${RINK_VIEWBOX.height}` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Base rink diagram */}
          <HockeyRinkSVG />

          {/* Measurement points overlay */}
          <g id="measurement-points">
            {points.map(point => (
              <PointMarker
                key={point.id}
                point={point}
                measurement={measurements[point.id]}
                isSelected={selectedPointId === point.id}
                isCompleted={measurements[point.id] !== undefined}
                onClick={() => handlePointClick(point)}
                showHeatMap={showHeatMap}
                readOnly={readOnly}
              />
            ))}
          </g>
        </svg>

        {/* Zoom controls */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          <button
            type="button"
            onClick={() => setViewBox(prev => ({
              ...prev,
              width: Math.max(50, prev.width * 0.8),
              height: Math.max(21.25, prev.height * 0.8),
            }))}
            className="p-1.5 bg-white/90 rounded border border-wolf-300 text-navy hover:bg-wolf-50"
            aria-label="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setViewBox(prev => ({
              ...prev,
              width: Math.min(RINK_VIEWBOX.width, prev.width * 1.2),
              height: Math.min(RINK_VIEWBOX.height, prev.height * 1.2),
            }))}
            className="p-1.5 bg-white/90 rounded border border-wolf-300 text-navy hover:bg-wolf-50"
            aria-label="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="p-1.5 bg-white/90 rounded border border-wolf-300 text-navy hover:bg-wolf-50"
            aria-label="Reset zoom"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-wolf" />
          <span className="text-wolf-600">Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-action" />
          <span className="text-wolf-600">Ideal (25-44mm)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-wolf-600">Warning</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-danger" />
          <span className="text-wolf-600">Critical</span>
        </div>
      </div>
    </div>
  );
}
