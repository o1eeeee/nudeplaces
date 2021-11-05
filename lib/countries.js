export function getCountries() {
  const countries = require('../data/countries.json')

  const filteredCountries = countries.filter(country => country.urlName !== "unknown");

  return filteredCountries;
}


export function getRegionsForCountry(country) {
  const regions = country.regions ?? [];

  return regions;
}


export function detectCountryFromLanguage(lang) {
  if (["de", "de-de"].includes(lang)) {
    return "germany";
  }

  if (lang === "de-at") {
    return "austria";
  }

  if (lang === "de-ch") {
    return "switzerland";
  }

  if (["en", "en-us"].includes(lang)) {
    return "united-states";
  }

  if (["en-gb"].includes(lang)) {
    return "united-kingdom";
  }

  if (["en-ca", "fr-ca"].includes(lang)) {
    return "canada";
  }

  if (["fr", "fr-fr"].includes(lang)) {
    return "france";
  }

  if (["es", "es-es"].includes(lang)) {
    return "spain";
  }

  if (lang === "es-ar") {
    return "argentina";
  }

  if (["pt", "pt-pt"].includes(lang)) {
    return "portugal";
  }

  if (lang === "pt-br") {
    return "brazil";
  }

  return null;
}