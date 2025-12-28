// Radius selector component using Shadcn Slider
'use client';

import { FaMapMarkerAlt } from 'react-icons/fa';
import { Slider, Label } from '@/components/ui';
import { cn } from '@/lib/utils';

interface RadiusSelectorProps {
  value: number;
  onChange: (radius: number) => void;
  disabled?: boolean;
  hasLocation?: boolean;
}

const RADIUS_STEPS = [5, 10, 25, 50, 100];
const MAX_RADIUS = 100;

export default function RadiusSelector({
  value,
  onChange,
  disabled = false,
  hasLocation = false
}: RadiusSelectorProps) {
  if (!hasLocation) {
    return null; // Only show when user has location
  }

  // Find the closest step for display
  const getLabel = (v: number) => {
    if (v === 0 || v >= MAX_RADIUS) return 'Any distance';
    return `${v} km`;
  };

  const handleSliderChange = (values: number[]) => {
    const newValue = values[0];
    // Snap to nearest step for better UX
    const closest = RADIUS_STEPS.reduce((prev, curr) =>
      Math.abs(curr - newValue) < Math.abs(prev - newValue) ? curr : prev
    );
    onChange(newValue >= MAX_RADIUS ? 0 : closest);
  };

  // Convert 0 (any distance) to max for slider display
  const sliderValue = value === 0 ? MAX_RADIUS : value;

  return (
    <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FaMapMarkerAlt className="w-3.5 h-3.5 text-primary" />
        <Label>Search Radius</Label>
        <span className="ml-auto text-primary font-semibold">
          {getLabel(value)}
        </span>
      </div>

      <Slider
        value={[sliderValue]}
        onValueChange={handleSliderChange}
        min={5}
        max={MAX_RADIUS}
        step={5}
        disabled={disabled}
        className={cn(disabled && 'opacity-50')}
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>5 km</span>
        <span>25 km</span>
        <span>50 km</span>
        <span>Any</span>
      </div>

      {value > 0 && value < MAX_RADIUS && (
        <p className="text-xs text-muted-foreground text-center">
          Showing salons within {value} km of your location
        </p>
      )}
    </div>
  );
}