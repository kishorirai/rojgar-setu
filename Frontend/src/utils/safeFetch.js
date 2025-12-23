const safeFetch = async (url, options = {}) => {
  const mergedOptions = { credentials: 'include', ...options };
  const res = await fetch(url, mergedOptions);
  const contentType = res.headers.get("content-type");
  if (!res.ok) {
    if (contentType && contentType.includes("application/json")) {
      const j = await res.json();
      throw new Error(j.error || j.message || "API error");
    } else {
      const text = await res.text();
      throw new Error(
        text.startsWith("<!doctype") || text.startsWith("<!DOCTYPE")
          ? "API error: Received HTML instead of JSON. (Check API URL, backend server and proxy/config.)"
          : `API error: ${res.status} ${text}`
      );
    }
  }
  return contentType && contentType.includes("application/json") ? res.json() : res.text();
};

export default safeFetch; 