// components-ui/src/components/sub/StarsRating - Updated with both static and interactive modes
import { useState } from 'react';

type StarsRatingProps = {
    rating: number;
    onChange?: (newRating: number) => void; // If provided, makes the component interactive
};

const StarsRating = ({ rating, onChange }: StarsRatingProps) => {
    const [hovered, setHovered] = useState<number | null>(null);

    const effectiveRating = hovered ?? rating;
    const isInteractive = typeof onChange === 'function';

    const handleClick = (index: number) => {
        if (isInteractive) onChange(index + 1);
    };

    const handleMouseEnter = (index: number) => {
        if (isInteractive) setHovered(index + 1);
    };

    const handleMouseLeave = () => {
        if (isInteractive) setHovered(null);
    };

    return (
        <ul className='flex-align gap-8 mb-16 '>
            {Array.from({ length: 5 }).map((_, index) => (
                <li
                    key={index}
                    className={`text-xl cursor-pointer ${
                        effectiveRating > index ? 'text-warning-600' : 'text-gray-300'
                    }`}
                    onClick={() => handleClick(index)}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                >
                    <i className={`ph-fill ${effectiveRating > index ? 'ph-star' : 'ph-star'} `} />
                </li>
            ))}
        </ul>
    );
};

export default StarsRating;
