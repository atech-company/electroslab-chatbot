"use strict";
(() => {
var exports = {};
exports.id = 198;
exports.ids = [198];
exports.modules = {

/***/ 730:
/***/ ((module) => {

module.exports = require("next/dist/server/api-utils/node.js");

/***/ }),

/***/ 76:
/***/ ((module) => {

module.exports = require("next/dist/server/future/route-modules/route-module.js");

/***/ }),

/***/ 295:
/***/ ((module) => {

module.exports = import("cheerio");;

/***/ }),

/***/ 298:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   config: () => (/* binding */ config),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   routeModule: () => (/* binding */ routeModule)
/* harmony export */ });
/* harmony import */ var next_dist_server_future_route_modules_pages_api_module__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(429);
/* harmony import */ var next_dist_server_future_route_modules_pages_api_module__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_pages_api_module__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(153);
/* harmony import */ var next_dist_build_webpack_loaders_next_route_loader_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(305);
/* harmony import */ var private_next_pages_api_search_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(364);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([private_next_pages_api_search_js__WEBPACK_IMPORTED_MODULE_3__]);
private_next_pages_api_search_js__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];
// @ts-ignore this need to be imported from next/dist to be external



const PagesAPIRouteModule = next_dist_server_future_route_modules_pages_api_module__WEBPACK_IMPORTED_MODULE_0__.PagesAPIRouteModule;
// Import the userland code.
// @ts-expect-error - replaced by webpack/turbopack loader

// Re-export the handler (should be the default export).
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_dist_build_webpack_loaders_next_route_loader_helpers__WEBPACK_IMPORTED_MODULE_2__/* .hoist */ .l)(private_next_pages_api_search_js__WEBPACK_IMPORTED_MODULE_3__, "default"));
// Re-export config.
const config = (0,next_dist_build_webpack_loaders_next_route_loader_helpers__WEBPACK_IMPORTED_MODULE_2__/* .hoist */ .l)(private_next_pages_api_search_js__WEBPACK_IMPORTED_MODULE_3__, "config");
// Create and export the route module that will be consumed.
const routeModule = new PagesAPIRouteModule({
    definition: {
        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__/* .RouteKind */ .x.PAGES_API,
        page: "/api/search",
        pathname: "/api/search",
        // The following aren't used in production.
        bundlePath: "",
        filename: ""
    },
    userland: private_next_pages_api_search_js__WEBPACK_IMPORTED_MODULE_3__
});

//# sourceMappingURL=pages-api.js.map
__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 364:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var cheerio__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(295);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([cheerio__WEBPACK_IMPORTED_MODULE_0__]);
cheerio__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];

// Helper function to extract price range from message
function extractPriceRange(message) {
    const pricePatterns = [
        /(\d+)\s*-\s*(\d+)\s*(?:dollars|USD|\$)/i,
        /(\d+)\s*to\s*(\d+)\s*(?:dollars|USD|\$)/i,
        /under\s*(\d+)\s*(?:dollars|USD|\$)/i,
        /less\s*than\s*(\d+)\s*(?:dollars|USD|\$)/i,
        /more\s*than\s*(\d+)\s*(?:dollars|USD|\$)/i,
        /above\s*(\d+)\s*(?:dollars|USD|\$)/i,
        /around\s*(\d+)\s*(?:dollars|USD|\$)/i,
        /approximately\s*(\d+)\s*(?:dollars|USD|\$)/i,
        /(\d+)\s*(?:dollars|USD|\$)/i
    ];
    for (const pattern of pricePatterns){
        const match = message.match(pattern);
        if (match) {
            if (match[1] && match[2]) {
                return {
                    min: parseInt(match[1]),
                    max: parseInt(match[2])
                };
            } else if (match[1]) {
                if (pattern.toString().includes("under") || pattern.toString().includes("less than")) {
                    return {
                        max: parseInt(match[1])
                    };
                } else if (pattern.toString().includes("more than") || pattern.toString().includes("above")) {
                    return {
                        min: parseInt(match[1])
                    };
                } else {
                    return {
                        target: parseInt(match[1])
                    };
                }
            }
        }
    }
    return null;
}
async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    const { query } = req.body;
    if (!query || typeof query !== "string" || !query.trim()) {
        return res.status(400).json({
            error: "Query is required"
        });
    }
    // Extract price range from query if present
    const priceRange = extractPriceRange(query);
    try {
        const response = await fetch(`https://electroslab.com/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error("Failed to fetch search results");
        }
        const html = await response.text();
        const $ = cheerio__WEBPACK_IMPORTED_MODULE_0__.load(html);
        const products = [];
        // Try different selectors for product cards
        const productSelectors = [
            ".product-card",
            ".product",
            ".item",
            ".product-item",
            "[data-product]",
            ".product-listing",
            ".search-result-item"
        ];
        // Log all image elements found
        console.log("All images found:", $("img").length);
        $("img").each((i, img)=>{
            console.log(`Image ${i}:`, $(img).attr("src"));
            // Log all attributes of the image
            console.log("Image attributes:", $(img).attr());
        });
        // Try each selector
        productSelectors.forEach(async (selector)=>{
            const elements = $(selector);
            for(let i = 0; i < elements.length; i++){
                const el = elements[i];
                const title = $(el).find(".product-title, h2, h3, .title, .name").first().text().trim();
                // Find the product link - look for links that are likely to be product pages
                let link = null;
                const possibleLinks = $(el).find("a");
                for(let j = 0; j < possibleLinks.length; j++){
                    const href = $(possibleLinks[j]).attr("href");
                    // Skip collection, category, or vendor links
                    if (href && !href.includes("/collections/") && !href.includes("/vendors") && !href.includes("/categories") && !href.includes("/search") && !href.includes("/cart") && !href.includes("/account")) {
                        link = href;
                        break;
                    }
                }
                // If no suitable link found, try the first link as fallback
                if (!link) {
                    link = $(el).find("a").first().attr("href");
                }
                // Check for sold out status
                const isSoldOut = $(el).find('.sold-out, .out-of-stock, [data-sold-out="true"], .stock-status:contains("Sold Out")').length > 0;
                if (isSoldOut) {
                    continue; // Skip this product if it's sold out
                }
                // Try different image selectors and attributes
                const imageSelectors = [
                    "img",
                    ".product-image img",
                    ".image img",
                    ".thumbnail img",
                    "[data-image]",
                    ".product-img img"
                ];
                let image = null;
                for (const imgSelector of imageSelectors){
                    const img = $(el).find(imgSelector).first();
                    if (img.length) {
                        // Try different attributes that might contain the image URL
                        const possibleAttrs = [
                            "src",
                            "data-src",
                            "data-lazy-src",
                            "data-original",
                            "data-srcset"
                        ];
                        for (const attr of possibleAttrs){
                            const value = img.attr(attr);
                            if (value && !value.includes("base64")) {
                                image = value;
                                break;
                            }
                        }
                        if (image) break;
                    }
                }
                const price = $(el).find(".price, .product-price, .amount, [data-price]").first().text().trim();
                // Enhanced description extraction
                const descriptionSelectors = [
                    ".description",
                    ".product-description",
                    ".short-description",
                    ".product-short-description",
                    ".product-details",
                    ".details",
                    ".product-info",
                    "p:not(.price):not(.product-price)",
                    "[data-description]",
                    ".product-summary",
                    ".product-content",
                    ".product-text",
                    ".product-info p",
                    ".product-details p",
                    ".product-description p"
                ];
                let description = "";
                for (const descSelector of descriptionSelectors){
                    const desc = $(el).find(descSelector).first().text().trim();
                    if (desc && desc.length > 0 && desc !== title && desc !== price) {
                        description = desc;
                        break;
                    }
                }
                // If no description found in the product card, try to get it from the product page
                if (!description && link) {
                    try {
                        const productPageResponse = await fetch(link.startsWith("http") ? link : `https://electroslab.com${link}`);
                        if (productPageResponse.ok) {
                            const productHtml = await productPageResponse.text();
                            const $product = cheerio__WEBPACK_IMPORTED_MODULE_0__.load(productHtml);
                            // Try to find description in the product page
                            const productDescSelectors = [
                                ".product-description",
                                ".description",
                                ".product-details",
                                ".product-info",
                                "#product-description",
                                ".product-summary",
                                ".product-content",
                                ".product-text",
                                ".product-info p",
                                ".product-details p",
                                ".product-description p",
                                '[itemprop="description"]',
                                ".product-description-content",
                                ".product-description-text"
                            ];
                            for (const selector of productDescSelectors){
                                const desc = $product(selector).first().text().trim();
                                if (desc && desc.length > 0 && desc !== title && desc !== price) {
                                    description = desc;
                                    break;
                                }
                            }
                            // If still no description, try to get it from meta description
                            if (!description) {
                                const metaDesc = $product('meta[name="description"]').attr("content");
                                if (metaDesc && metaDesc.length > 0) {
                                    description = metaDesc;
                                }
                            }
                        }
                    } catch (error) {
                        console.error("Error fetching product description:", error);
                    }
                }
                // Extract numeric price value
                const priceValue = parseFloat(price.replace(/[^0-9.]/g, ""));
                // Check if product matches price range
                let matchesPriceRange = true;
                if (priceRange && priceValue) {
                    if (priceRange.min && priceValue < priceRange.min) matchesPriceRange = false;
                    if (priceRange.max && priceValue > priceRange.max) matchesPriceRange = false;
                    if (priceRange.target && Math.abs(priceValue - priceRange.target) > priceRange.target * 0.2) matchesPriceRange = false;
                }
                if (title && link && matchesPriceRange) {
                    let imageUrl = "";
                    if (image) {
                        // Remove any query parameters or fragments
                        const cleanImage = image.split("?")[0].split("#")[0];
                        if (cleanImage.startsWith("http")) {
                            imageUrl = cleanImage;
                        } else if (cleanImage.startsWith("//")) {
                            imageUrl = `https:${cleanImage}`;
                        } else if (cleanImage.startsWith("/")) {
                            imageUrl = `https://electroslab.com${cleanImage}`;
                        } else {
                            imageUrl = `https://electroslab.com/${cleanImage}`;
                        }
                    }
                    // Clean up description
                    if (description) {
                        description = description.replace(/\s+/g, " ") // Replace multiple spaces with single space
                        .replace(/\n+/g, " ") // Replace newlines with space
                        .trim();
                    }
                    // Ensure the product link is absolute and points to the exact product
                    let productLink = link;
                    if (!productLink.startsWith("http")) {
                        // If the link is relative, make it absolute
                        productLink = `https://electroslab.com${productLink.startsWith("/") ? "" : "/"}${productLink}`;
                    }
                    // Remove any query parameters, fragments, or tracking parameters that might affect the product page
                    productLink = productLink.split("?")[0] // Remove query parameters
                    .split("#")[0] // Remove fragments
                    .replace(/\/$/, ""); // Remove trailing slash
                    // Log the product link for debugging
                    console.log("Product link:", {
                        original: link,
                        processed: productLink
                    });
                    products.push({
                        title,
                        link: productLink,
                        image: imageUrl,
                        price,
                        description: description || "No description available"
                    });
                }
            }
        });
        // Log the final products array
        console.log("Products found:", products.length);
        console.log("Products:", JSON.stringify(products, null, 2));
        res.status(200).json({
            products
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({
            error: error.message || "Internal server error"
        });
    }
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [172], () => (__webpack_exec__(298)));
module.exports = __webpack_exports__;

})();