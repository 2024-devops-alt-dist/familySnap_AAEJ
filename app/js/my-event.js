console.log("hello from my event");

const queryString_url_id = window.location.search;
console.log("queryString_url_id", queryString_url_id);
const urlParams = new URLSearchParams(queryString_url_id);
console.log("urlParams", urlParams);
const theId = urlParams.get("id");
console.log("theId", theId);
