module.exports = function(eleventyConfig) {
    // Copy static assets directly to the output
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("assets/images");
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("js");
 
    return {
        pathPrefix: "/LateLateShift/",
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            data: "_data"
        },
        templateFormats: ["html", "njk", "md"],
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk",
        dataTemplateEngine: "njk",
    };
};