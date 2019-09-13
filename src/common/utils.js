import LZString from "lz-string";

export function parseQuery(queryString) {
  const pairs = (queryString[0] === "?"
    ? queryString.substr(1)
    : queryString
  ).split("&");

  return pairs.reduce((queryObj, pair) => {
    const [key, value] = pair.split("=");

    if (!key) {
      return queryObj;
    }

    queryObj[decodeURIComponent(key)] = decodeURIComponent(value || "");

    return queryObj;
  }, {});
}

export function stringifyQuery(queryObj) {
  return Object.keys(queryObj)
    .map(
      key => `${encodeURIComponent(key)}=${encodeURIComponent(queryObj[key])}`
    )
    .join("&");
}

export function compress(data) {
  const query = {};

  try {
    Object.keys(data).forEach(
      key => (query[key] = LZString.compressToEncodedURIComponent(data[key]))
    );
  } catch (e) {
    // return silently
    return "";
  }

  return "?" + stringifyQuery(query);
}

export function decompress(str) {
  const queryObj = parseQuery(str);

  try {
    Object.keys(queryObj).forEach(
      key =>
        (queryObj[key] = LZString.decompressFromEncodedURIComponent(
          queryObj[key]
        ))
    );
  } catch (e) {
    // return silently
    return {};
  }

  return queryObj;
}
