"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Post, Dynamic, Exercise } from '@repo/api-bridge';
import ModernResourcesSection from './ModernResourcesSection';
import './ModernResourcesSection.css';

interface ResourcesSectionProps {
    posts: Post[];
    dynamics: Dynamic[];
    exercises: Exercise[];
}

const ResourcesSection: React.FC<ResourcesSectionProps> = ({
    posts,
    dynamics,
    exercises
}) => {
    return (
        <ModernResourcesSection 
            posts={posts}
            dynamics={dynamics}
            exercises={exercises}
        />
    );
};

export default ResourcesSection;