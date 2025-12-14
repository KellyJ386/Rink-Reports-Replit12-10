import { memo } from 'react';

interface HockeyRinkSVGProps {
  className?: string;
}

/**
 * SVG Hockey Rink Component
 * USA Hockey regulation rink (200' x 85')
 * ViewBox scaled to these dimensions for easy coordinate mapping
 */
export const HockeyRinkSVG = memo(function HockeyRinkSVG({ className }: HockeyRinkSVGProps) {
  return (
    <svg
      viewBox="0 0 200 85"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hockey Rink Diagram"
    >
      <defs>
        {/* Gradient for ice surface */}
        <linearGradient id="iceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0f4f8" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0f4f8" />
        </linearGradient>

        {/* Pattern for crease */}
        <pattern id="creasePattern" patternUnits="userSpaceOnUse" width="2" height="2">
          <rect width="2" height="2" fill="#87CEEB" fillOpacity="0.3" />
        </pattern>
      </defs>

      {/* Ice surface with rounded corners */}
      <rect
        x="0.5"
        y="0.5"
        width="199"
        height="84"
        rx="14"
        ry="14"
        fill="url(#iceGradient)"
        stroke="#002244"
        strokeWidth="1"
      />

      {/* Boards outline (inner) */}
      <rect
        x="2"
        y="2"
        width="196"
        height="81"
        rx="12"
        ry="12"
        fill="none"
        stroke="#A5ACAF"
        strokeWidth="0.5"
        strokeDasharray="2,1"
      />

      {/* Center ice red line */}
      <line
        x1="100"
        y1="2"
        x2="100"
        y2="83"
        stroke="#DC3545"
        strokeWidth="1"
      />

      {/* Center ice circle */}
      <circle
        cx="100"
        cy="42.5"
        r="15"
        fill="none"
        stroke="#002244"
        strokeWidth="0.5"
      />

      {/* Center ice dot */}
      <circle
        cx="100"
        cy="42.5"
        r="1"
        fill="#002244"
      />

      {/* Left blue line */}
      <line
        x1="64"
        y1="2"
        x2="64"
        y2="83"
        stroke="#002244"
        strokeWidth="1"
      />

      {/* Right blue line */}
      <line
        x1="136"
        y1="2"
        x2="136"
        y2="83"
        stroke="#002244"
        strokeWidth="1"
      />

      {/* Left goal line */}
      <line
        x1="11"
        y1="2"
        x2="11"
        y2="83"
        stroke="#DC3545"
        strokeWidth="0.5"
      />

      {/* Right goal line */}
      <line
        x1="189"
        y1="2"
        x2="189"
        y2="83"
        stroke="#DC3545"
        strokeWidth="0.5"
      />

      {/* Left crease */}
      <path
        d="M 11 36.5 L 15 36.5 A 6 6 0 0 1 15 48.5 L 11 48.5"
        fill="url(#creasePattern)"
        stroke="#DC3545"
        strokeWidth="0.3"
      />

      {/* Right crease */}
      <path
        d="M 189 36.5 L 185 36.5 A 6 6 0 0 0 185 48.5 L 189 48.5"
        fill="url(#creasePattern)"
        stroke="#DC3545"
        strokeWidth="0.3"
      />

      {/* Left goal */}
      <rect
        x="7"
        y="39"
        width="4"
        height="7"
        fill="none"
        stroke="#002244"
        strokeWidth="0.5"
      />

      {/* Right goal */}
      <rect
        x="189"
        y="39"
        width="4"
        height="7"
        fill="none"
        stroke="#002244"
        strokeWidth="0.5"
      />

      {/* Face-off circles - Left zone */}
      <circle cx="31" cy="21" r="15" fill="none" stroke="#DC3545" strokeWidth="0.3" />
      <circle cx="31" cy="21" r="1" fill="#DC3545" />
      <circle cx="31" cy="64" r="15" fill="none" stroke="#DC3545" strokeWidth="0.3" />
      <circle cx="31" cy="64" r="1" fill="#DC3545" />

      {/* Face-off circles - Right zone */}
      <circle cx="169" cy="21" r="15" fill="none" stroke="#DC3545" strokeWidth="0.3" />
      <circle cx="169" cy="21" r="1" fill="#DC3545" />
      <circle cx="169" cy="64" r="15" fill="none" stroke="#DC3545" strokeWidth="0.3" />
      <circle cx="169" cy="64" r="1" fill="#DC3545" />

      {/* Neutral zone face-off dots */}
      <circle cx="80" cy="21" r="1" fill="#DC3545" />
      <circle cx="80" cy="64" r="1" fill="#DC3545" />
      <circle cx="120" cy="21" r="1" fill="#DC3545" />
      <circle cx="120" cy="64" r="1" fill="#DC3545" />

      {/* Zone labels */}
      <text x="11" y="80" fontSize="3" fill="#A5ACAF" textAnchor="start" fontFamily="sans-serif">
        NORTH
      </text>
      <text x="189" y="80" fontSize="3" fill="#A5ACAF" textAnchor="end" fontFamily="sans-serif">
        SOUTH
      </text>
    </svg>
  );
});
