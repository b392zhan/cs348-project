import csv
from chardet import detect

input_filename = 'books.csv'
output_filename = 'limited_books.csv'
max_books = 10000

with open(input_filename, 'rb') as rawfile:
    result = detect(rawfile.read(10000))

file_encoding = result['encoding']
print(f"Detected encoding: {file_encoding}")

with open(input_filename, 'r', encoding=file_encoding, errors='replace') as infile, \
     open(output_filename, 'w', encoding='utf-8', newline='') as outfile:

    reader = csv.reader(infile, delimiter=';', quotechar='"')
    writer = csv.writer(outfile, delimiter=';', quotechar='"', quoting=csv.QUOTE_ALL)
    
    header = next(reader)
    writer.writerow(header)
    
    count = 0
    for row in reader:
        if count < max_books:
            try:
                writer.writerow(row)
                count += 1
            except Exception as e:
                print(f"Skipping row due to error: {e}")
        else:
            break

print(f"Successfully limited to {count} books. Output written to {output_filename}.")
