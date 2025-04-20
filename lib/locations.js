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
    return `/${encodeURIComponent(country.urlName)}/${encodeURIComponent(location.attributes.seo_name)}`;
}

export function getDistanceBetweenLocationsInKm(location1, location2) {
    const earthRadius = 6371;
    const lat1 = location1.attributes.latitude;
    const lon1 = location1.attributes.longitude;
    const lat2 = location2.attributes.latitude;
    const lon2 = location2.attributes.longitude;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}