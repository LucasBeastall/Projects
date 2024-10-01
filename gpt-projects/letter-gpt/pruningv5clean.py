import sys
from tqdm import tqdm

def load_clean_vocab(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return set(f.read())

def prune_text(input_text, clean_vocab):
    return ''.join(char for char in input_text if char in clean_vocab)

def remove_double_spaces(text):
    while '  ' in text:
        text = text.replace('  ', ' ')
    return text

def process_file(input_file, output_file, clean_vocab):
    with open(input_file, 'r', encoding='utf-8') as in_f, \
         open(output_file, 'w', encoding='utf-8') as out_f:
        
        # Get total file size for progress bar
        in_f.seek(0, 2)
        total_size = in_f.tell()
        in_f.seek(0)

        # Initialize progress bar
        pbar = tqdm(total=total_size, unit='B', unit_scale=True, desc="Processing")

        for line in in_f:
            pruned_line = prune_text(line, clean_vocab)
            cleaned_line = remove_double_spaces(pruned_line)
            out_f.write(cleaned_line)
            
            # Update progress bar
            pbar.update(len(line.encode('utf-8')))

        pbar.close()

if __name__ == "__main__":
    clean_vocab = load_clean_vocab("cleanVocab.txt")
    process_file("output_val.txt", "output_val_pruned.txt", clean_vocab)
    print("Processing complete. Output saved to output_val_pruned.txt")
