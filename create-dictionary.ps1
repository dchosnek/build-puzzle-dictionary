
$rows = Import-Csv blogtext.csv | Select-Object -ExpandProperty text #-First 20000

# initialize the dictionary and a row counter
$dictionary = @{}
# $counter = 0

foreach($article in $rows) {

    # replace foreign characters and non-alpha with a space (regex replace)
    $article = $article -replace '[^a-zA-Z\s]', ' '

    # create a unique list of words from the current article
    $article.ToUpper() -split '\s+' | ForEach-Object {
        # only include this word if it has fewer than 3 repeating chars
        if($_ -notmatch '(.)\1{2}') {
            $dictionary[$_] = $true
        }
    }

    # display a counter for every 1000 rows accessed
    # $counter += 1
    # if($counter % 1000 -eq 0) { Write-Host $counter, $dictionary.get_Count() }
}

# use GetEnumerator() because one of the Keys for $dictionary will likely be
# the word "Keys" and then we'll end up only exporting the value of that one 
# entry in the hashtable
$dictionary.GetEnumerator() | Select-Object -ExpandProperty Name | Sort-Object | Set-Content 'dictionary-ps.txt'
