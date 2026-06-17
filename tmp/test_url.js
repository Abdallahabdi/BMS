// Testing Axios-like concatenation logic
function resolve(baseURL, url) {
    // This is a simplified version of what Axios roughly does
    // but in reality Axios just appends unless url is absolute.
    // However, some versions/configs behave differently with leading slashes.
    return baseURL + url;
}

const baseURL = "https://baafin.onrender.com/api";
const url = "/auth/register";
console.log("Result:", resolve(baseURL, url));
