import * as React from 'react';
import { cn } from '@/lib/utils';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface StarRatingProps {
    value: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    reviewCount?: number;
    interactive?: boolean;
    onChange?: (value: number) => void;
    className?: string;
}

const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
};

function StarRating({
    value,
    max = 5,
    size = 'md',
    showValue = false,
    reviewCount,
    interactive = false,
    onChange,
    className,
}: StarRatingProps) {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);
    const displayValue = hoverValue ?? value;

    const stars = React.useMemo(() => {
        const result = [];
        for (let i = 1; i <= max; i++) {
            if (displayValue >= i) {
                result.push({ type: 'full', index: i });
            } else if (displayValue >= i - 0.5) {
                result.push({ type: 'half', index: i });
            } else {
                result.push({ type: 'empty', index: i });
            }
        }
        return result;
    }, [displayValue, max]);

    const handleClick = (index: number) => {
        if (interactive && onChange) {
            onChange(index);
        }
    };

    const handleMouseEnter = (index: number) => {
        if (interactive) {
            setHoverValue(index);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverValue(null);
        }
    };

    return (
        <div className={cn('flex items-center gap-1', className)}>
            <div
                className={cn('flex', sizes[size], interactive && 'cursor-pointer')}
                onMouseLeave={handleMouseLeave}
                role={interactive ? 'slider' : 'img'}
                aria-label={`Rating: ${value} out of ${max} stars`}
                aria-valuenow={interactive ? value : undefined}
                aria-valuemin={interactive ? 0 : undefined}
                aria-valuemax={interactive ? max : undefined}
            >
                {stars.map(({ type, index }) => (
                    <span
                        key={index}
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => handleMouseEnter(index)}
                        className={cn(
                            'text-yellow-400',
                            interactive && 'hover:scale-110 transition-transform'
                        )}
                    >
                        {type === 'full' && <FaStar />}
                        {type === 'half' && <FaStarHalfAlt />}
                        {type === 'empty' && <FaRegStar className="text-gray-300" />}
                    </span>
                ))}
            </div>
            {showValue && (
                <span className="text-sm font-medium text-foreground ml-1">
                    {value.toFixed(1)}
                </span>
            )}
            {reviewCount !== undefined && (
                <span className="text-sm text-muted-foreground">
                    ({reviewCount.toLocaleString()})
                </span>
            )}
        </div>
    );
}

export { StarRating };
