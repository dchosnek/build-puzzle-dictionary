import pandas as pd
import re
import time

# record the start time
start_time = time.time()

# look for non-alpha characters
pattern_alpha = re.compile(r'[^a-zA-Z\s]')

def transform(x):
    '''Take paragraphs of text and return a list of words that make up that
    paragraph. Ignore all non-alpha characters, including punctuation.
    '''
    # my_string = re.sub(r'[^a-zA-Z\s]', ' ', x)
    my_string = pattern_alpha.sub(' ', x)
    return my_string.upper().split()

# grab the "text" column of the CSV file
df_acticles = pd.read_csv("blogtext.csv")['text']

# retrieve only the words that make up the paragraphs in the "text" column
df_words = df_acticles.apply(lambda x: transform(x))

# save only the unique words
unique = set(df_words.explode().dropna())

# define the regular expression pattern for 3 or more consecutive repeating characters
pattern_repeat = re.compile(r'(.)\1{2}')

# write to file only the words that do not have consecutive repeating chars
with open('dictionary-py.txt', 'w', encoding='utf-8') as file:
    for element in sorted(unique):
        if not pattern_repeat.search(element):
            file.write(F'{element}\n')

# calculate the duration of this script
duration = time.time() - start_time

print(f"Script execution time: {duration} seconds")
