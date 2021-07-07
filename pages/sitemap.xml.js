import { renderToStaticMarkup } from "react-dom/server";
import { getCountries } from '../lib/countries';

const Sitemap = ({ pages }) => {

  return (
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      {pages?.map((page, index) => {
        return (
          <url key={index}>
            <loc>{`${process.env.WEBSITE_URL}/${page.url}`}</loc>
            <lastmod>{page?.lastmod}</lastmod>
          </url>
        );
      })}
    </urlset>
  )
}

export default Sitemap;

export const getServerSideProps = async ({ res }) => {
  if (res) {
    const dateNow = new Date().toISOString();
    const pages = [
      {
        url: "",
        lastmod: dateNow,
      },
      {
        url: "about",
        lastmod: dateNow,
      },
      {
        url: "add",
        lastmod: dateNow,
      },
    ];

    const countries = getCountries();

    countries.map((country) => {
      pages.push({
        url: country.urlName,
        lastmod: dateNow,
      })
    })


    res.setHeader("Content-Type", "text/xml");
    res.write(renderToStaticMarkup(
      <Sitemap pages={pages} />
    ));
    res.end();

  }

  return {
    props: {},
  };

};