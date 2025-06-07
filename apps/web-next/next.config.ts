// apps/web-next/next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
    transpilePackages: [
        '@repo/components'
    ],
    images: {
        domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
        // Allow images from packages
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    sassOptions: {
        includePaths: ['../../packages'],
    },
    webpack: (config) => {
        // Handle image imports from packages
        config.module.rules.push({
            test: /\.(png|jpg|gif|svg)$/,
            type: 'asset/resource',
            generator: {
                filename: 'static/images/[name].[hash][ext]',
            },
        });

        // Add alias for package assets
        config.resolve.alias = {
            ...config.resolve.alias,
            '@repo/components/assets': '../../packages/components/assets',
        };

        return config;
    },
    // Experimental features for better package support
    experimental: {
        esmExternals: 'loose',
    },
};

export default withNextIntl(nextConfig);