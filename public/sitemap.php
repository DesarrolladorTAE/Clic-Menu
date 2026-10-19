<?php

declare(strict_types=1);

/*
 * Genera un sitemap XML con las páginas públicas y las publicaciones disponibles en la API externa del blog.
 * No modifica ni administra las publicaciones externas.
 */

const SITE_URL = 'https://clicmenu.com.mx';

const BLOG_API_URL =
'https://api.tecnologiasadministrativas.com/api/public/v1/clic-menu/blogs/blog-clicmenu/posts';

const MAX_PAGES = 100;

/*
 * Consultar una página de publicaciones.
 */
function fetchPostsPage(int $page): array
{
    $query = http_build_query([
        'page' => $page,
        'per_page' => 50,
        'order' => 'latest',
    ]);

    $curl = curl_init(BLOG_API_URL . '?' . $query);

    if ($curl === false) {
        throw new RuntimeException('No fue posible consultar las publicaciones.');
    }

    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'User-Agent: ClicMenuSitemap/1.0',
        ],
    ]);

    $body = curl_exec($curl);
    $statusCode = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);

    curl_close($curl);

    if ($body === false || $statusCode < 200 || $statusCode >= 300) {
        throw new RuntimeException('No fue posible obtener las publicaciones.');
    }

    $payload = json_decode(
        $body,
        true,
        512,
        JSON_THROW_ON_ERROR
    );

    if (!is_array($payload) || !isset($payload['data']) || !is_array($payload['data'])) {
        throw new RuntimeException('La información de las publicaciones no está disponible.');
    }

    return $payload;
}

/*
 * Normalizar la fecha de modificación.
 */
function normalizeLastmod(mixed $value): ?string
{
    if (!is_string($value) || trim($value) === '') {
        return null;
    }

    try {
        return (new DateTimeImmutable($value))->format(DATE_ATOM);
    } catch (Exception) {
        return null;
    }
}

/*
 * Obtener las direcciones públicas e indexables.
 */
function getSitemapUrls(): array
{
    $urls = [
        SITE_URL . '/' => null,
        SITE_URL . '/planes' => null,
        SITE_URL . '/contacto' => null,
        SITE_URL . '/terminos-y-condiciones' => null,
        SITE_URL . '/blog' => null,
        SITE_URL . '/recursos/menu-qr-con-canva' => null,
    ];

    $page = 1;

    do {
        $payload = fetchPostsPage($page);

        foreach ($payload['data'] as $post) {
            if (!is_array($post)) {
                continue;
            }

            $slug = trim((string) ($post['slug'] ?? ''));

            if ($slug === '' || preg_match('/^[a-z0-9][a-z0-9_-]*$/i', $slug) !== 1) {
                continue;
            }

            if (strtolower($slug) === 'prueba') {
                continue;
            }

            if (empty($post['published_at'])) {
                continue;
            }

            $seo = is_array($post['seo'] ?? null) ? $post['seo'] : [];

            if (($seo['robots_index'] ?? true) === false) {
                continue;
            }

            $url = SITE_URL . '/blog/' . rawurlencode($slug);
            $updatedAt = $post['updated_at'] ?? $post['published_at'];

            $urls[$url] = normalizeLastmod($updatedAt);
        }

        $lastPage = filter_var(
            $payload['meta']['last_page'] ?? 1,
            FILTER_VALIDATE_INT
        );

        if ($lastPage === false || $lastPage < 1 || $lastPage > MAX_PAGES) {
            throw new RuntimeException('No fue posible completar la lista de publicaciones.');
        }

        $page++;
    } while ($page <= $lastPage);

    return $urls;
}

/*
 * Construir el contenido XML del sitemap.
 */
function buildSitemapXml(array $urls): string
{
    $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    $xml .= "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";

    foreach ($urls as $url => $lastmod) {
        $xml .= "  <url>\n";
        $xml .= '    <loc>' . htmlspecialchars($url, ENT_XML1 | ENT_QUOTES, 'UTF-8') . "</loc>\n";

        if ($lastmod !== null) {
            $xml .= '    <lastmod>' . htmlspecialchars($lastmod, ENT_XML1 | ENT_QUOTES, 'UTF-8') . "</lastmod>\n";
        }

        $xml .= "  </url>\n";
    }

    $xml .= "</urlset>\n";

    return $xml;
}

/*
 * Responder con el mapa del sitio.
 */
try {
    $urls = getSitemapUrls();
    $xml = buildSitemapXml($urls);

    header('Content-Type: application/xml; charset=UTF-8');
    header('Cache-Control: public, max-age=900');

    echo $xml;
} catch (Throwable $exception) {
    error_log('Clic Menu sitemap: ' . $exception->getMessage());

    http_response_code(503);

    header('Content-Type: text/plain; charset=UTF-8');
    header('Cache-Control: no-store');

    echo 'No fue posible actualizar el mapa del sitio. Intenta nuevamente más tarde.';
}
