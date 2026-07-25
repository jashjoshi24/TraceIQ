import os
import hashlib
from typing import Tuple

STORAGE_DIR = os.getenv("PCAP_STORAGE_DIR", "./pcap-storage")

class StorageService:
    @staticmethod
    def ensure_dir():
        if not os.path.exists(STORAGE_DIR):
            os.makedirs(STORAGE_DIR)

    @staticmethod
    async def save_file(file_content: bytes, original_filename: str) -> Tuple[str, str]:
        """
        Saves the file to local storage, named by its SHA-256 hash.
        Returns a tuple of (file_path, sha256_hash).
        """
        StorageService.ensure_dir()
        
        sha256_hash = hashlib.sha256(file_content).hexdigest()
        
        # We store files by their hash to prevent duplicates on disk
        file_path = os.path.join(STORAGE_DIR, f"{sha256_hash}.pcap")
        
        if not os.path.exists(file_path):
            with open(file_path, "wb") as f:
                f.write(file_content)
                
        return file_path, sha256_hash
