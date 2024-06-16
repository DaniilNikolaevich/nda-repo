/** @type {import("next").NextConfig} */
const nextConfig = {
    sassOptions: {
        prependData: `
        @import "src/_app/styles/general/_mixins.scss";
        `,
    },
    experimental: {
        optimizePackageImports: ['@phosphor-icons/react'],
    },
    modularizeImports: {
        '@phosphor-icons/react': {
            transform: '@phosphor-icons/react/dist/ssr/{{member}}',
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*',
            },
        ],
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack'],
        });

        return config;
    },
};

export default nextConfig;
