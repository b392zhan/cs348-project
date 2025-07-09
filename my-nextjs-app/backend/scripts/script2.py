import csv

input_file = 'limited_books.csv'
output_file = 'cleaned_books.csv'

columns_to_remove = {'Year-Of-Publication', 'Image-URL-S', 'Image-URL-M'}

with open(input_file, 'r', encoding='utf-8') as infile, \
     open(output_file, 'w', encoding='utf-8', newline='') as outfile:

    reader = csv.reader(infile, delimiter=';', quotechar='"')
    writer = csv.writer(outfile, delimiter=';', quotechar='"', quoting=csv.QUOTE_ALL)
    
    header = next(reader)
    remove_indices = [i for i, col in enumerate(header) if col in columns_to_remove]
    new_header = [col for i, col in enumerate(header) if i not in remove_indices]
    writer.writerow(new_header)
    
    for row in reader:
        new_row = [col for i, col in enumerate(row) if i not in remove_indices]
        writer.writerow(new_row)

print(f"Columns removed. Cleaned data saved to {output_file}")
