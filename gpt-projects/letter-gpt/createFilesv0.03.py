import os
import lzma
from tqdm import tqdm
import concurrent.futures
import random
import multiprocessing
import re

def process_file(args):
    directory, filename, output_file, vocab = args
    file_path = os.path.join(directory, filename)
    with lzma.open(file_path, "rt", encoding="utf-8") as infile:
        text = infile.read()
    
    # Remove file names from the text
    text = re.sub(r'\d+-[a-f0-9]{32}\.txt', '', text)
    
    with open(output_file, "a", encoding="utf-8") as outfile:
        outfile.write(text)
    characters = set(text)
    return characters

def xz_files_in_dir(directory):
    return [filename for filename in os.listdir(directory) if filename.endswith(".xz") and os.path.isfile(os.path.join(directory, filename))]

def process_files_in_parallel(files, folder_path, output_file):
    vocab = set()
    with concurrent.futures.ProcessPoolExecutor(max_workers=4) as executor:
        args = [(folder_path, filename, output_file, vocab) for filename in files]
        for characters in tqdm(executor.map(process_file, args), total=len(files)):
            vocab.update(characters)
    return vocab

def sample_random_text(input_file, output_file, sample_size=5000):
    with open(input_file, 'r', encoding='utf-8') as f:
        f.seek(0, 2)
        file_size = f.tell()
        start_point = random.randint(0, max(0, file_size - sample_size))
        f.seek(start_point)
        sample_text = f.read(sample_size)
        if len(sample_text) < sample_size:
            f.seek(0)
            sample_text += f.read(sample_size - len(sample_text))
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sample_text)

def main():
    folder_path = "openwebtext"
    output_file_train = "output_train.txt"
    output_file_val = "output_val.txt"
    vocab_file = "vocab.txt"

    files = xz_files_in_dir(folder_path)
    total_files = len(files)
    split_index = int(total_files * 0.9)  # 90% for training
    files_train = files[:split_index]
    files_val = files[split_index:]

    sample_rate = 1
    files_train_sampled = random.sample(files_train, max(1, int(len(files_train) * sample_rate)))
    files_val_sampled = random.sample(files_val, max(1, int(len(files_val) * sample_rate)))

    open(output_file_train, 'w').close()
    open(output_file_val, 'w').close()

    vocab_train = process_files_in_parallel(files_train_sampled, folder_path, output_file_train)
    vocab_val = process_files_in_parallel(files_val_sampled, folder_path, output_file_val)

    vocab = vocab_train.union(vocab_val)
    with open(vocab_file, "w", encoding="utf-8") as vfile:
        for char in sorted(vocab):
            vfile.write(char + '\n')

    sample_random_text(output_file_train, "Example.txt")

if __name__ == '__main__':
    multiprocessing.freeze_support()
    main()
