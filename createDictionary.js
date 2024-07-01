console.time("Script execution time");
const fs = require('fs');
const csv = require('csv-parser');

// pattern that matches three consecutive identical letters
const pattern = /(.)\1\1/;

function readCSV(filename, column, callback) {
    const uniqueWords = new Set();

    fs.createReadStream(filename)
        .pipe(csv())
        .on('data', (row) => {

            // words are separated by a space
            const words = row[column].replace(/[^a-zA-Z]+/g, ' ').split(' ');
            words.forEach(word => {
                // save only if the word is valid and does not have three
                // consecutive identical characters
                if (word && !pattern.test(word.toUpperCase())) {
                    uniqueWords.add(word.trim().toUpperCase());
                }
            });
        })
        .on('end', () => {
            // sort the output
            callback(Array.from(uniqueWords).sort());
        });
}

// parse the CSV file and dump sorted results to a file
readCSV('blogtext.csv', 'text', (uniqueWords) => {
    fs.writeFileSync('dictionary-js.txt', uniqueWords.join('\n'));
    console.timeEnd("Script execution time");
});
