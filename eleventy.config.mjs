export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("assets");
    // Unlisted draft-recap pages: prebuilt standalone HTML from
    // .claude/skills/lls-draft-recap — copied verbatim, not templated.
    eleventyConfig.addPassthroughCopy("src/draft-recaps");
    eleventyConfig.ignores.add("src/draft-recaps/**");
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("js");

    // Keeper rows sorted by cost (cheapest round first), "No Keeper"/n/a excluded.
    eleventyConfig.addFilter("topValueKeeps", (rows, n = 5) =>
        rows
            .filter((r) => /^\d+$/.test(String(r[4]).trim()))
            .sort((a, b) => Number(a[4]) - Number(b[4]))
            .slice(0, n)
    );

    // Forward-looking keeper eligibility for the season after `rows`' season.
    // Second consecutive keeps (years contains "2") return to the pool; everyone
    // else can be kept again one round earlier (round-1 cost is allowed — the
    // round-1 ban applies to draft position, not keeper cost).
    eleventyConfig.addFilter("keeperOutlook", (rows) =>
        rows
            .filter((r) => /^\d+$/.test(String(r[4]).trim()))
            .map((r) => {
                const secondYear = String(r[5]).includes("2");
                const cost = Number(r[4]);
                return {
                    manager: r[0],
                    team: r[1],
                    player: String(r[2]).replace(/†/g, "").trim(),
                    pos: r[3],
                    cost,
                    eligible: !secondYear,
                    nextCost: secondYear ? null : Math.max(cost - 1, 1),
                };
            })
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
