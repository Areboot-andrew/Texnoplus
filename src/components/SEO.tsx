import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    canonicalUrl?: string;
    imageUrl?: string;
    robots?: string;
    jsonLd?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, keywords, canonicalUrl, imageUrl, robots, jsonLd }) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            {robots && <meta name="robots" content={robots} />}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
            <meta property="og:site_name" content="Техноплюс" />
            <meta property="og:locale" content="uk_UA" />
            {imageUrl && <meta property="og:image" content={imageUrl} />}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {imageUrl && <meta name="twitter:image" content={imageUrl} />}
            {jsonLd && <script type="application/ld+json">{jsonLd}</script>}
        </Helmet>
    );
};

export default SEO;
