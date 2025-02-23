import hashlib
import time
import json

class Block:
    def __init__(self, index, user_id, biometric_type, biometric_hash, previous_hash, timestamp=None):
        self.index = index
        self.user_id = user_id
        self.biometric_type = biometric_type
        self.fingerprint_hash = biometric_hash  # Storing the hashed biometric data
        self.timestamp = timestamp or time.time()
        self.previous_hash = previous_hash
        self.nonce = 0  # For Proof of Work
        self.hash = self.calculate_hash()
    
    def calculate_hash(self):
        block_string = json.dumps({
            "index": self.index,
            "user_id": self.user_id,
            "biometric_type": self.biometric_type,
            "fingerprint_hash": self.fingerprint_hash,
            "timestamp": self.timestamp,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce
        }, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()
    
    def mine_block(self, difficulty=4):
        while self.hash[:difficulty] != "0" * difficulty:
            self.nonce += 1
            self.hash = self.calculate_hash()
