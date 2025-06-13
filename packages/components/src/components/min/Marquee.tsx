// packages/components/src/components/min/Marquee.tsx
'use client';

import React from 'react';
import MarqueeReact from 'react-fast-marquee';

interface MarqueeItem {
    id: string;
    text: string;
    icon?: string;
}

interface MarqueeProps {
    items?: MarqueeItem[];
    speed?: number;
    direction?: 'left' | 'right';
    className?: string;
}

const Marquee: React.FC<MarqueeProps> = ({
                                             items = [
                                                 { id: '1', text: 'Expert Teachers', icon: '👨‍🏫' },
                                                 { id: '2', text: 'Interactive Learning', icon: '📚' },
                                                 { id: '3', text: 'Global Community', icon: '🌍' },
                                                 { id: '4', text: 'Personalized Education', icon: '🎯' },
                                                 { id: '5', text: 'Modern Technology', icon: '💻' },
                                                 { id: '6', text: 'Proven Results', icon: '✨' },
                                             ],
                                             speed = 50,
                                             direction = 'left',
                                             className = ''
                                         }) => {
    return (
        <section className={`marquee-section py-60 border-8 overflow-hidden ${className} mt-120 bg-primary-300`}>
            <MarqueeReact
                speed={speed}
                direction={direction}
                gradient={false}
                pauseOnHover={true}
            >
                <div className="marquee-content flex-align gap-60 ">
                    {items.map((item) => (
                        <div key={item.id} className="marquee-item flex-align gap-16 text-white">
                            {item.icon && (
                                <span className="marquee-icon text-2xl">
                                    {item.icon}
                                </span>
                            )}
                            <span className="marquee-text text-xl fw-medium">
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </MarqueeReact>
        </section>
    );
};

export default Marquee;