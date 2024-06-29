const fs = require('fs');
const axios = require('axios');

const sourceFilename = 'source-dict.txt';
const destFilename = 'dictionary-valid.txt';

// Lookup a word via the dictionary API and return a list of valid uppercase
// words (or an empty list).
function dictionaryLookup(word, token) {
    return new Promise((resolve, reject) => {

        const lookupUrl = `https://www.dictionaryapi.com/api/v3/references/sd2/json/${word}?key=${token}`;

        axios.get(lookupUrl)
            .then(response => {

                // the response from the API could be
                // 1. empty: word not found
                // 2: list of words: word was misspelled and these are possible intended words
                // 3: list of maps: the word was found in the dictionary

                if (response.data.length == 0) {                    // case 1
                    resolve(new Array());
                }
                else if (typeof response.data[0] == 'string') {     // case 2
                    resolve(response.data
                        .filter(element => /^[A-Za-z]+$/.test(element))  // remove non-alphas
                        .map(str => str.toUpperCase()));
                }
                else if (typeof response.data[0] == 'object') {     // case 3
                    if (response.data[0].f1 == 'abbreviation') {    // ignore abbreviations
                        resolve(new Array());
                    } else {
                        resolve(new Array(word.toUpperCase()));
                    }
                }
                else {
                    console.error(`Major issue with word ${word}`);
                    resolve(new Array);
                }

            })
            .catch(error => {
                reject(word);   // send the word back as the reason the promise failed
            })
    });
}

function readFileToSet(filename, startSlice, endSlice, existingWords) {
    return new Promise((resolve, reject) => {

        const wordSet = new Set();

        const token = process.env.TOKEN;
        if (!process.env.TOKEN) {
            throw new Error("Environment variable TOKEN is not set.");
        }

        // Read the file line by line
        const fileContent = fs.readFileSync(filename, 'utf8');
        const lines = fileContent.split('\n').slice(startSlice, endSlice);

        // every line in the file is a promise to look up that word, though
        // we will trim empty lines and lines containing words that are already
        // in our target dictionary to minimize the number of API calls (no need
        // to look up a word that already exists)
        const promises = lines.map(word => word.trim())     // trim each line (word)
            .filter(word => word)                           // filter out empty lines
            .filter(word => !existingWords.has(word))       // filter out words that already exist
            .map(word => {
                return dictionaryLookup(word, token);
        });

        // when all promises are complete, add the responses to the set
        Promise.allSettled(promises)
            .then(promiseResponses => {

                const problemWords = new Set();

                // The result from allSettled is either 'fulfilled' or 'rejected'.
                // Foreach that is fulfilled, add the words in that response to
                // wordSet. But for the rest, just send an error to the console.
                promiseResponses.forEach(content => {
                    if (content.status == 'fulfilled') {
                        content.value.forEach(element => { wordSet.add(element); });
                    }
                    else {
                        problemWords.add(content.reason);
                        console.error(`Problem with word: ${content.reason}`);
                    }
                });

                // rewrite the original file with the slice missing but with the
                // problem words added back in
                newLines = fileContent.split('\n').slice(endSlice);
                problemWords.forEach(word => { newLines.unshift(word); });
                fs.writeFileSync(sourceFilename, newLines.join('\n'), (error) => {
                    if (error) {
                        console.error('Error rewriting source diciontary to file: ', error);
                    }
                });

                // append the set of words collected to the destination minus the
                // words that are already in the existing output dictionary
                const finalWordSet = [...wordSet].filter(word => !existingWords.has(word));
                if (finalWordSet.length) {
                    fs.appendFile(destFilename, Array.from(finalWordSet).join('\n') + '\n', (error) => {
                        if (error) {
                            console.error('Error appending to destination dictionary: ', error);
                        }
                    });
                }

                resolve(finalWordSet.length);
            },
                error => {
                    console.error(error);
                    resolve(wordSet.size);
                }
            );

    })
}

// we can only look up a small number of words at a time in the dictionary API
// so we operate on only 10 words at a time -- when that is complete, we do it 
// again (looping 10 times at 10 words each time for a total of 100 words)
async function loopTenTimes() {

    // get the words from the target as we don't want to look up a word that is
    // already in our destination file
    const fileContent = fs.readFileSync(destFilename, 'utf8');
    existingWords = new Set(fileContent.split('\n').map(word => word.trim()).filter(word => word));

    for (let step = 0; step < 100; step++) {
        await new Promise(resolve => {
            readFileToSet(sourceFilename, 0, 10, existingWords)
                .then(outputSize => {
                    console.log(`${outputSize} words added to dictionary.`);
                    resolve();
                });
        })
    }
}

loopTenTimes();
