module.exports = function(eleventyConfig) {
    // Copy static assets directly to the output
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("js");
  
    return {
      dir: {
        input: "src",
        output: "docs",
        includes: "_includes"
      },
      templateFormats: ["html", "njk", "md"],
      htmlTemplateEngine: "njk",
      markdownTemplateEngine: "njk",
      dataTemplateEngine: "njk"
    };
  };