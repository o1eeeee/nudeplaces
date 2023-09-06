import { getRegionsForCountry } from "./countries";

export function buildLocationInfo({ neighbourhood, municipality, subregion }) {
    const locationInfo = new Set();
    neighbourhood && locationInfo.add(neighbourhood);
    municipality && locationInfo.add(municipality);
    subregion && locationInfo.add(subregion);
    return [...locationInfo].join(", ");
}


export function buildLocationStreetAndHouseNr({ street, housenumber }) {
    const streetAndHouseNr = [];
    street && streetAndHouseNr.push(street);
    housenumber && streetAndHouseNr.push(housenumber);
    return streetAndHouseNr.join(" ");
}


export function buildLocationPostcodeAndMunicipality({ postcode, municipality }) {
    const postcodeAndMunicipality = [];
    postcode && postcodeAndMunicipality.push(postcode);
    municipality && postcodeAndMunicipality.push(municipality);
    return postcodeAndMunicipality.join(" ");
}


export function buildLocationRegionAndCountry(region, country) {
    const regionAndCountry = [];
    const allRegions = getRegionsForCountry(country);
    const regionFromList = region && allRegions.filter(allRegion => region === allRegion.code)[0];
    const regionName = regionFromList ? regionFromList.name : region;
    regionName && regionAndCountry.push(regionName);
    country && regionAndCountry.push(country.name);
    return regionAndCountry.join(", ");
}


export function buildLocationLastUpdatedDate(location) {
    const date = new Date(location.updatedAt);
    return date.toLocaleDateString('de-DE', {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
}


export function buildLocationUrl(location, country) {
    return `/${encodeURIComponent(country.urlName)}/${encodeURIComponent(location.seo_name)}`;
}