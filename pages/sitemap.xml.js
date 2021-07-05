import fs from 'fs';
import { getCountries } from '../lib/countries';

const Sitemap = () => {

}

export default Sitemap;

export const getServerSideProps = ({ res }) => {
    const baseUrl = process.env.WEBSITE_URL;

    const staticPages = fs
        .readdirSync("pages")
        .filter((staticPage) => {
            return ![
                "_app.js",
                "_document.js",
                "[country]",
                "404.js",
                "500.js",
                "sitemap.xml.js",
            ].includes(staticPage);
        })
        .map((staticPagePath) => {
            return `${baseUrl}/${staticPagePath}`;
        });

    const countries = getCountries();

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticPages
            .map((url) => {
                return `
              <url>
                <loc>${url}</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
                <changefreq>monthly</changefreq>
                <priority>1.0</priority>
              </url>
            `;
            })
            .join("")}
        ${countries
            .map((country) => {
                return `
                  <url>
                    <loc>${baseUrl}/${country.urlName}</loc>
                    <lastmod>${new Date().toISOString()}</lastmod>
                    <changefreq>weekly</changefreq>
                    <priority>1.0</priority>
                  </url>
                `;
            })
            .join("")}
      </urlset>
    `;

    res.setHeader("Content-Type", "text/xml");
    res.write(sitemap);
    res.end();

    return {
        props: {},
    };
};