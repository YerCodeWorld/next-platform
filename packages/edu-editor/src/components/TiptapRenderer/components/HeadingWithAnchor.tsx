import React, { ReactNode } from "react";
import { JSX } from "react";

interface HeadingWithAnchorProps {
    level: number;
    id?: string;
    children?: ReactNode;
}

const HeadingWithAnchor = ({ level, children, id }: HeadingWithAnchorProps) => {
    const Heading = `h${level}` as keyof JSX.IntrinsicElements;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (id) {
            // Update URL hash without page reload
            window.history.pushState(null, '', `#${id}`);
            // Scroll to element
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <Heading id={id}>
            <button
                onClick={handleClick}
                className="not-prose relative group font-inherit hover:before:content-['#'] hover:before:absolute hover:before:-left-6 hover:before:top-1/2 hover:before:-translate-y-1/2 hover:before:opacity-70 hover:before:text-[1em] text-left w-full"
            >
                {children}
            </button>
        </Heading>
    );
};

export default HeadingWithAnchor;