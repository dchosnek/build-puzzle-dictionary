# Build puzzle dictionary

Building a dictionary to be used for multiple word-based puzzles

### This is work in progress!

So far, I have scripts in multiple languages for pulling English words from a CSV containing blog articles. The CSV comes from Kaggle and is titled [Blog Authorship Corpus](https://www.kaggle.com/datasets/rtatman/blog-authorship-corpus). It provides the full text from more than 600,000 blogs.

Roughly, the flow of all of these scripts is:
1. Import the CSV and operate only on the `text` column.
1. Each row is a single blog/article. For each row, regex replace non-alpha characters with spaces (saving only A-Z and a-z) and then split the blog/article by spaces. This creates a list of words.
1. For each word, save it to a set (for uniqueness).
1. Alphabetize the set and write it to a file.

The regex replace I'm using is quite heavy-handed. Apostrophes, commas, and dashes all become delimiters that separate "words". The phrase "He's my side-kick" will eventually be part of the following alphabetized set:

```
{ 'HE', 'KICK', 'MY', 'S', 'SIDE' }
```

"Sidekick" is a real word that should not be hyphenated, and this logic will not capture that word.

These blogs are written by people with different styles. They use hyphens in the wrong places, but they also intentionally misspell words for emphasis:

* AAAAAAAAAAARRRRRRRRRGGGGHHHH
* MIIIIIIGHT
* SSSSSSSSLEEEPY
* ZZZZZZZZZZ

These people also *unintentionally* misspell words:

* DIFFICLUT
* DIFFICTULT
* DIFFICUALT
* DIFFICUILT
* DIFFICUIT

To avoid words like the above, I also added a regex check to reject words that have three or more consecutive identical characters. Words like `beee` would be rejected but `beekeeper` would not.
