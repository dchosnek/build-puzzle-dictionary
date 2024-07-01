# Build puzzle dictionary

Building a dictionary to be used for multiple word-based puzzles. The file `dictionary-verified.txt` contains over 60,000 English words (one per line) that have been verified by an online dictionary API.

# Process for building the dictionary

There are two main steps, both of which were lengthy.

1. Extract words from a repository of blogs
1. Determine which of those words are real English language words

## Extract words from a repo of blogs

There is a repo of blogs on Kaggle titled [Blog Authorship Corpus](https://www.kaggle.com/datasets/rtatman/blog-authorship-corpus). It provides the full text from more than 600,000 blogs. That is our source for English words.

I have scripts in multiple languages for pulling English words from this CSV.

Roughly, the flow of all of these scripts is:
1. Import the CSV and operate only on the `text` column.
1. Each row is a single blog/article. For each row, regex replace non-alpha characters with spaces (saving only A-Z and a-z) and then split the blog/article by spaces. This creates a list of words.
1. For each word, save it to a set (for uniqueness).
1. Alphabetize the set and write it to a file.

The regex replace I'm using is quite heavy-handed. Apostrophes, commas, and dashes all become delimiters that separate "words". The phrase "He's my side-kick" will eventually be part of the following alphabetized set:

```
{ 'HE', 'KICK', 'MY', 'S', 'SIDE' }
```

"Sidekick" is a real word that should not be hyphenated, and this logic will not capture that word. The hope is that with over 600,000 blogs, the words "sidekick" will appear in another blog without the hyphen and it will be captured there.

## Verify words are real words

These blogs are written by people with different styles. They use hyphens in the wrong places, but they also intentionally misspell words for emphasis:

* AAAAAAAAAAARRRRRRRRRGGGGHHHH
* MIIIIIIGHT
* SSSSSSSSLEEEPY
* ZZZZZZZZZZ

Authors also *unintentionally* misspell words:

* DIFFICLUT
* DIFFICTULT
* DIFFICUALT
* DIFFICUILT
* DIFFICUIT

None of the words extracted from the blogs can be trusted. Every word has to be searched in an online dictionary. The dictionary I'm using returns one of the following:

* an empty list if the word does not even resemble a real word (example: `AAAARRRRGH`)
* a definition if the word is a real word spelling correctly (example: `DIFFICULT`)
* a list of alternative words if the word resembles a real word (example: `DIFFICLUT`)

Here is an example of the list of alternatives provided for a misspelled word.

```
[
    "difficult",
    "difficulty",
    "difficultly",
    "diffident",
    "difficulties",
    "different",
    "diffidently",
    "diffusible",
    "sufficient"
]
```
