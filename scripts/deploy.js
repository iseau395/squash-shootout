// @ts-check
import ghpages from'gh-pages';

const url = "https://github.com/iseau395/squash-shootout";

console.log(`Pushing to the gh-pages branch on ${url} in 5 seconds...`)

let errored = false;
setTimeout(
    () => {
        ghpages.publish('public', 
            {
                branch: 'gh-pages',
                repo: url,
                message: `Automatically update github pages branch`,
            },
            (err) => {
                errored = true;
                if (err) console.error(err);
            }
        );
    
        if (!errored)
            console.log("Successfully Published!");
    },
    5000
)