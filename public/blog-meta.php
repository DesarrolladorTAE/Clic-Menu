<?php

declare(strict_types=1);

const BLOG_API_URL =
    'https://api.tecnologiasadministrativas.com/api/public/v1/clic-menu/blogs/blog-clicmenu/posts';

const PUBLIC_SITE_URL =
    'https://clicmenu.com.mx';

const DEFAULT_OG_IMAGE =
    'https://clicmenu.com.mx/images/seo/clic-menu-preview.png';

header(
    'Content-Type: text/html; charset=UTF-8'
);

/*
 * Evitar que el navegador, proxy o CDN
 * conserve una versión anterior del HTML.
 *
 * WhatsApp puede manejar su propia caché,
 * pero el servidor siempre entregará los
 * datos actuales disponibles en la API.
 */
header(
    'Cache-Control: no-store, no-cache, must-revalidate, max-age=0'
);

header(
    'Pragma: no-cache'
);

header(
    'Expires: 0'
);

$slug = trim(
    (string) ($_GET['slug'] ?? '')
);

if (
    $slug === '' ||
    preg_match(
        '/^[a-z0-9][a-z0-9_-]*$/i',
        $slug
    ) !== 1
) {
    http_response_code(404);

    echo loadFallbackHtml(
        $slug
    );

    exit;
}

try {
    $post = fetchBlogPost(
        $slug
    );

    $template = loadMainTemplate();

    echo injectPostMetadata(
        $template,
        $post,
        $slug
    );
} catch (BlogPostNotFoundException) {
    http_response_code(404);

    echo loadFallbackHtml(
        $slug
    );
} catch (Throwable $exception) {
    /*
     * Si la API presenta un error temporal,
     * se intenta entregar el HTML estático
     * generado durante el último build.
     */
    $staticPostPath =
        __DIR__ .
        '/blog/' .
        $slug .
        '/index.html';

    if (is_file($staticPostPath)) {
        http_response_code(200);

        echo readUtf8File(
            $staticPostPath
        );

        exit;
    }

    http_response_code(503);

    echo loadFallbackHtml(
        $slug
    );
}

final class BlogPostNotFoundException extends RuntimeException
{
}

function fetchBlogPost(
    string $slug
): array {
    $url =
        BLOG_API_URL .
        '/' .
        rawurlencode($slug);

    $curl = curl_init($url);

    if ($curl === false) {
        throw new RuntimeException(
            'No fue posible inicializar cURL.'
        );
    }

    curl_setopt_array(
        $curl,
        [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 15,

            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'User-Agent: ClicMenuBlogMetadata/1.0',
            ],

            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]
    );

    $body = curl_exec($curl);

    if ($body === false) {
        $error = curl_error($curl);

        curl_close($curl);

        throw new RuntimeException(
            'Error consultando la API: ' .
            $error
        );
    }

    $statusCode = (int) curl_getinfo(
        $curl,
        CURLINFO_RESPONSE_CODE
    );

    curl_close($curl);

    if ($statusCode === 404) {
        throw new BlogPostNotFoundException(
            'La publicación no existe.'
        );
    }

    if (
        $statusCode < 200 ||
        $statusCode >= 300
    ) {
        throw new RuntimeException(
            'La API respondió con código ' .
            $statusCode .
            '.'
        );
    }

    $payload = json_decode(
        $body,
        true,
        512,
        JSON_THROW_ON_ERROR
    );

    $post = $payload['data'] ?? null;

    if (!is_array($post)) {
        throw new RuntimeException(
            'La API no devolvió una publicación válida.'
        );
    }

    return $post;
}

function loadMainTemplate(): string
{
    $templatePath =
        __DIR__ .
        '/index.html';

    if (!is_file($templatePath)) {
        throw new RuntimeException(
            'No existe el index.html principal.'
        );
    }

    return readUtf8File(
        $templatePath
    );
}

function loadFallbackHtml(
    string $slug
): string {
    if ($slug !== '') {
        $staticPostPath =
            __DIR__ .
            '/blog/' .
            $slug .
            '/index.html';

        if (is_file($staticPostPath)) {
            return readUtf8File(
                $staticPostPath
            );
        }
    }

    $mainIndexPath =
        __DIR__ .
        '/index.html';

    if (is_file($mainIndexPath)) {
        return readUtf8File(
            $mainIndexPath
        );
    }

    return '<!doctype html>' .
        '<html lang="es-MX">' .
        '<head>' .
        '<meta charset="UTF-8">' .
        '<title>Clic Menu</title>' .
        '</head>' .
        '<body></body>' .
        '</html>';
}

function readUtf8File(
    string $path
): string {
    $content = file_get_contents(
        $path
    );

    if ($content === false) {
        throw new RuntimeException(
            'No fue posible leer el archivo: ' .
            $path
        );
    }

    return $content;
}

function injectPostMetadata(
    string $html,
    array $post,
    string $slug
): string {
    $html = removeExistingMetadata(
        $html
    );

    $seo = is_array(
        $post['seo'] ?? null
    )
        ? $post['seo']
        : [];

    $openGraph = is_array(
        $post['open_graph'] ?? null
    )
        ? $post['open_graph']
        : [];

    $title = firstFilledValue(
        [
            $seo['title'] ?? null,
            $post['title'] ?? null,
            'Blog Clic Menu',
        ]
    );

    $description = firstFilledValue(
        [
            $seo['description'] ?? null,
            $post['excerpt'] ?? null,
            'Contenido y herramientas para mejorar la operación de restaurantes.',
        ]
    );

    $publicUrl =
        PUBLIC_SITE_URL .
        '/blog/' .
        rawurlencode($slug);

    $canonicalUrl = firstFilledValue(
        [
            $seo['canonical_url'] ?? null,
            $openGraph['url'] ?? null,
            $post['url'] ?? null,
            $publicUrl,
        ]
    );

    $ogTitle = firstFilledValue(
        [
            $openGraph['title'] ?? null,
            $title,
        ]
    );

    $ogDescription = firstFilledValue(
        [
            $openGraph['description'] ?? null,
            $description,
        ]
    );

    $imageData = is_array(
        $openGraph['image'] ?? null
    )
        ? $openGraph['image']
        : [];

    $coverData = is_array(
        $post['cover'] ?? null
    )
        ? $post['cover']
        : [];

    $imageUrl = firstFilledValue(
        [
            $imageData['url'] ?? null,
            $coverData['url'] ?? null,
            DEFAULT_OG_IMAGE,
        ]
    );

    $imageAlt = firstFilledValue(
        [
            $imageData['alt_text'] ?? null,
            $openGraph['title'] ?? null,
            $post['title'] ?? null,
            'Clic Menu',
        ]
    );

    $ogType = firstFilledValue(
        [
            $openGraph['type'] ?? null,
            'article',
        ]
    );

    $keywords = normalizeKeywords(
        $seo['keywords'] ?? []
    );

    $robotsIndex =
        !array_key_exists(
            'robots_index',
            $seo
        ) ||
        (bool) $seo['robots_index'];

    $robotsFollow =
        !array_key_exists(
            'robots_follow',
            $seo
        ) ||
        (bool) $seo['robots_follow'];

    $robots = implode(
        ', ',
        [
            $robotsIndex
                ? 'index'
                : 'noindex',

            $robotsFollow
                ? 'follow'
                : 'nofollow',
        ]
    );

    $publishedTime = normalizeNullableString(
        $post['published_at'] ?? null
    );

    $modifiedTime = normalizeNullableString(
        $post['updated_at'] ?? null
    );

    $section = null;

    if (
        is_array(
            $post['category'] ?? null
        )
    ) {
        $section = normalizeNullableString(
            $post['category']['name'] ?? null
        );
    }

    $tags = normalizeTags(
        $post['tags'] ?? []
    );

    $structuredData =
        normalizeStructuredData(
            $post['structured_data'] ?? null,
            $post,
            $canonicalUrl,
            $imageUrl,
            $description
        );

    $metadata = buildMetadataHtml(
        title: $title,
        description: $description,
        keywords: $keywords,
        robots: $robots,
        canonicalUrl: $canonicalUrl,
        ogType: $ogType,
        ogTitle: $ogTitle,
        ogDescription: $ogDescription,
        imageUrl: $imageUrl,
        imageAlt: $imageAlt,
        imageWidth: nullablePositiveInteger(
            $imageData['width'] ?? null
        ),
        imageHeight: nullablePositiveInteger(
            $imageData['height'] ?? null
        ),
        publishedTime: $publishedTime,
        modifiedTime: $modifiedTime,
        section: $section,
        tags: $tags,
        structuredData: $structuredData
    );

    $result = preg_replace(
        '/<\/head>/i',
        $metadata .
        PHP_EOL .
        '  </head>',
        $html,
        1
    );

    if (
        !is_string($result) ||
        $result === $html
    ) {
        throw new RuntimeException(
            'No fue posible insertar los metadatos.'
        );
    }

    return $result;
}

function removeExistingMetadata(
    string $html
): string {
    $html = preg_replace(
        '/<title\b[^>]*>[\s\S]*?<\/title>\s*/i',
        '',
        $html
    ) ?? $html;

    $metaKeys = [
        'description',
        'keywords',
        'robots',
        'author',
        'theme-color',

        'og:type',
        'og:title',
        'og:description',
        'og:image',
        'og:image:secure_url',
        'og:image:width',
        'og:image:height',
        'og:image:alt',
        'og:url',
        'og:site_name',

        'article:published_time',
        'article:modified_time',
        'article:section',
        'article:tag',

        'twitter:card',
        'twitter:title',
        'twitter:description',
        'twitter:image',
    ];

    foreach ($metaKeys as $metaKey) {
        $escapedKey = preg_quote(
            $metaKey,
            '/'
        );

        $html = preg_replace(
            '/<meta\b' .
            '(?=[^>]*(?:name|property)=["\']' .
            $escapedKey .
            '["\'])' .
            '[^>]*\/?>\s*/i',
            '',
            $html
        ) ?? $html;
    }

    $html = preg_replace(
        '/<link\b' .
        '(?=[^>]*rel=["\']canonical["\'])' .
        '[^>]*\/?>\s*/i',
        '',
        $html
    ) ?? $html;

    $html = preg_replace(
        '/<script\b' .
        '(?=[^>]*type=["\']application\/ld\+json["\'])' .
        '[^>]*>[\s\S]*?<\/script>\s*/i',
        '',
        $html
    ) ?? $html;

    return $html;
}

function buildMetadataHtml(
    string $title,
    string $description,
    string $keywords,
    string $robots,
    string $canonicalUrl,
    string $ogType,
    string $ogTitle,
    string $ogDescription,
    string $imageUrl,
    string $imageAlt,
    ?int $imageWidth,
    ?int $imageHeight,
    ?string $publishedTime,
    ?string $modifiedTime,
    ?string $section,
    array $tags,
    array $structuredData
): string {
    $lines = [
        '    <title data-default-seo="true">' .
        escapeHtml($title) .
        '</title>',

        '',

        '    <meta data-default-seo="true" name="description" content="' .
        escapeHtml($description) .
        '" />',
    ];

    if ($keywords !== '') {
        $lines[] =
            '    <meta data-default-seo="true" name="keywords" content="' .
            escapeHtml($keywords) .
            '" />';
    }

    $lines[] =
        '    <meta data-default-seo="true" name="robots" content="' .
        escapeHtml($robots) .
        '" />';

    $lines[] =
        '    <link data-default-seo="true" rel="canonical" href="' .
        escapeHtml($canonicalUrl) .
        '" />';

    $lines[] = '';

    $lines[] =
        '    <meta data-default-seo="true" property="og:type" content="' .
        escapeHtml($ogType) .
        '" />';

    $lines[] =
        '    <meta data-default-seo="true" property="og:title" content="' .
        escapeHtml($ogTitle) .
        '" />';

    $lines[] =
        '    <meta data-default-seo="true" property="og:description" content="' .
        escapeHtml($ogDescription) .
        '" />';

    $lines[] =
        '    <meta data-default-seo="true" property="og:image" content="' .
        escapeHtml($imageUrl) .
        '" />';

    $lines[] =
        '    <meta data-default-seo="true" property="og:image:secure_url" content="' .
        escapeHtml($imageUrl) .
        '" />';

    $lines[] =
        '    <meta data-default-seo="true" property="og:image:alt" content="' .
        escapeHtml($imageAlt) .
        '" />';

    if ($imageWidth !== null) {
        $lines[] =
            '    <meta data-default-seo="true" property="og:image:width" content="' .
            $imageWidth .
            '" />';
    }

    if ($imageHeight !== null) {
        $lines[] =
            '    <meta data-default-seo="true" property="og:image:height" content="' .
            $imageHeight .
            '" />';
    }

    $lines[] =
        '    <meta data-default-seo="true" property="og:url" content="' .
        escapeHtml($canonicalUrl) .
        '" />';

    $lines[] =
        '    <meta data-default-seo="true" property="og:site_name" content="Clic Menu" />';

    if ($publishedTime !== null) {
        $lines[] =
            '    <meta data-default-seo="true" property="article:published_time" content="' .
            escapeHtml($publishedTime) .
            '" />';
    }

    if ($modifiedTime !== null) {
        $lines[] =
            '    <meta data-default-seo="true" property="article:modified_time" content="' .
            escapeHtml($modifiedTime) .
            '" />';
    }

    if ($section !== null) {
        $lines[] =
            '    <meta data-default-seo="true" property="article:section" content="' .
            escapeHtml($section) .
            '" />';
    }

    foreach ($tags as $tag) {
        $lines[] =
            '    <meta data-default-seo="true" property="article:tag" content="' .
            escapeHtml($tag) .
            '" />';
    }

    $lines[] = '';

    $lines[] =
        '    <meta data-default-seo="true" name="twitter:card" content="summary_large_image" />';

    $lines[] =
        '    <meta data-default-seo="true" name="twitter:title" content="' .
        escapeHtml($ogTitle) .
        '" />';

    $lines[] =
        '    <meta data-default-seo="true" name="twitter:description" content="' .
        escapeHtml($ogDescription) .
        '" />';

    $lines[] =
        '    <meta data-default-seo="true" name="twitter:image" content="' .
        escapeHtml($imageUrl) .
        '" />';

    if ($structuredData !== []) {
        $json = json_encode(
            $structuredData,
            JSON_UNESCAPED_UNICODE |
            JSON_UNESCAPED_SLASHES |
            JSON_HEX_TAG |
            JSON_HEX_AMP |
            JSON_HEX_APOS |
            JSON_HEX_QUOT |
            JSON_THROW_ON_ERROR
        );

        $lines[] = '';

        $lines[] =
            '    <script data-default-seo="true" type="application/ld+json">' .
            $json .
            '</script>';
    }

    return implode(
        PHP_EOL,
        $lines
    );
}

function normalizeStructuredData(
    mixed $value,
    array $post,
    string $canonicalUrl,
    string $imageUrl,
    string $description
): array {
    if (is_array($value)) {
        return $value;
    }

    if (
        is_string($value) &&
        trim($value) !== ''
    ) {
        $decoded = json_decode(
            $value,
            true
        );

        if (is_array($decoded)) {
            return $decoded;
        }
    }

    $structuredData = [
        '@context' => 'https://schema.org',
        '@type' => 'BlogPosting',

        'headline' => firstFilledValue(
            [
                $post['title'] ?? null,
                'Blog Clic Menu',
            ]
        ),

        'description' => $description,
        'image' => $imageUrl,
        'mainEntityOfPage' => $canonicalUrl,

        'publisher' => [
            '@type' => 'Organization',
            'name' => 'Clic Menu',
        ],
    ];

    $publishedAt = normalizeNullableString(
        $post['published_at'] ?? null
    );

    if ($publishedAt !== null) {
        $structuredData['datePublished'] =
            $publishedAt;
    }

    $updatedAt = normalizeNullableString(
        $post['updated_at'] ?? null
    );

    if ($updatedAt !== null) {
        $structuredData['dateModified'] =
            $updatedAt;
    }

    if (
        is_array(
            $post['author'] ?? null
        ) &&
        !empty(
            $post['author']['name']
        )
    ) {
        $structuredData['author'] = [
            '@type' => 'Person',
            'name' => (string) $post['author']['name'],
        ];
    }

    return $structuredData;
}

function normalizeKeywords(
    mixed $keywords
): string {
    if (is_array($keywords)) {
        return implode(
            ', ',
            array_values(
                array_filter(
                    array_map(
                        static fn (
                            mixed $value
                        ): string =>
                            trim(
                                (string) $value
                            ),
                        $keywords
                    ),
                    static fn (
                        string $value
                    ): bool =>
                        $value !== ''
                )
            )
        );
    }

    return trim(
        (string) $keywords
    );
}

function normalizeTags(
    mixed $tags
): array {
    if (!is_array($tags)) {
        return [];
    }

    $normalized = [];

    foreach ($tags as $tag) {
        if (is_string($tag)) {
            $name = trim($tag);
        } elseif (is_array($tag)) {
            $name = trim(
                (string) (
                    $tag['name'] ?? ''
                )
            );
        } else {
            continue;
        }

        if ($name !== '') {
            $normalized[] = $name;
        }
    }

    return array_values(
        array_unique(
            $normalized
        )
    );
}

function nullablePositiveInteger(
    mixed $value
): ?int {
    $number = filter_var(
        $value,
        FILTER_VALIDATE_INT
    );

    if (
        $number === false ||
        $number <= 0
    ) {
        return null;
    }

    return $number;
}

function normalizeNullableString(
    mixed $value
): ?string {
    $normalized = trim(
        (string) $value
    );

    return $normalized !== ''
        ? $normalized
        : null;
}

function firstFilledValue(
    array $values
): string {
    foreach ($values as $value) {
        $normalized = trim(
            (string) $value
        );

        if ($normalized !== '') {
            return $normalized;
        }
    }

    return '';
}

function escapeHtml(
    string $value
): string {
    return htmlspecialchars(
        $value,
        ENT_QUOTES |
        ENT_SUBSTITUTE,
        'UTF-8'
    );
}