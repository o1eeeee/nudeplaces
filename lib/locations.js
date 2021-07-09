import { getRegionsForCountry } from "./countries";

export function buildLocationInfo(location) {
    const locationInfo = [];
    location.neighbourhood && locationInfo.push(location.neighbourhood);
    location.municipality && locationInfo.push(location.municipality);
    location.subregion && locationInfo.push(location.subregion);
    return locationInfo.join(", ");
}


export function buildLocationStreetAndHouseNr(location) {
    const streetAndHouseNr = [];
    location.street && streetAndHouseNr.push(location.street);
    location.housenumber && streetAndHouseNr.push(location.housenumber);
    return streetAndHouseNr.join(" ");
}


export function buildLocationPostcodeAndMunicipality(location) {
    const postcodeAndMunicipality = [];
    location.postcode && postcodeAndMunicipality.push(location.postcode);
    location.municipality && postcodeAndMunicipality.push(location.municipality);
    return postcodeAndMunicipality.join(" ");
}


export function buildLocationRegionAndCountry(location, country) {
    const regionAndCountry = [];
    const allRegions = getRegionsForCountry(country);
    const regionFromList = location.region && allRegions.filter(region => location.region === region.code)[0];
    const regionName = regionFromList ? regionFromList.name : location.region;
    regionName && regionAndCountry.push(regionName);
    country && regionAndCountry.push(country.name);
    return regionAndCountry.join(", ");
}


export function buildLocationLastUpdatedDate(location) {
    const date = new Date(location.modifyDate.split(" ")[0]);
    return date.toLocaleDateString('de-DE', {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
}


export function buildLocationUrl(location, country) {
    return `/${encodeURIComponent(country.urlName)}/${encodeURIComponent(location.seoName)}`;
}