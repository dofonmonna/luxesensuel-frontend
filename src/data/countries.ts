import metadata from "libphonenumber-js/metadata.min.json";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";

// Génère la liste complète des pays avec nom FR + indicatif
const countries = getCountries().map((isoCode) => ({
  isoCode,
  name: new Intl.DisplayNames(["fr"], { type: "region" }).of(isoCode),
  dialCode: getCountryCallingCode(isoCode)
}));

export default countries;
