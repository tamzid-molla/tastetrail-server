
export const capitalizeFirstLetter = (value = "") => {
  return value
    .trim()
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase());
};
