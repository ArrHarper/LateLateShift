export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("js");

    // Keeper rows sorted by cost (cheapest round first), "No Keeper"/n/a excluded.
    eleventyConfig.addFilter("topValueKeeps", (rows, n = 5) =>
        rows
            .filter((r) => /^\d+$/.test(String(r[4]).trim()))
            .sort((a, b) => Number(a[4]) - Number(b[4]))
            .slice(0, n)
    );

    // 0.476 -> ".476"
    eleventyConfig.addFilter("pct3", (v) => Number(v).toFixed(3).replace(/^0/, ""));

    // 9743.8 -> "9,743.80"
    eleventyConfig.addFilter("num2", (v) =>
        Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );

    // "2026-08-13" -> "Aug 13"
    eleventyConfig.addFilter("newsDate", (iso) => {
        const [y, m, d] = String(iso).split("-").map(Number);
        return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
        });
    });

    // [2021, 2022] -> "'21 · '22"
    eleventyConfig.addFilter("shortYears", (years) =>
        (years || []).map((y) => "'" + String(y).slice(2)).join(" · ")
    );

    return {
        pathPrefix: "/LateLateShift/",
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            data: "_data",
        },
        templateFormats: ["html", "njk", "md"],
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk",
    };
}
