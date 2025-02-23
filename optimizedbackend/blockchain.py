import time
from typing import Optional
from optimizedbackend.models import Block
from optimizedbackend.config import Config

class Blockchain:
    def __init__(self):
        self.chain = [self.create_genesis_block()]

    def create_genesis_block(self):
        return Block(0, "GENESIS", "GENESIS", "GENESIS", "0")

    def get_latest_block(self):
        return self.chain[-1]

    def add_block(self, user_id: str, biometric_type: str, biometric_hash: str):
        latest_block = self.get_latest_block()
        new_block = Block(len(self.chain), user_id, biometric_type, biometric_hash, latest_block.hash)
        new_block.mine_block(Config.DIFFICULTY)
        self.chain.append(new_block)
        return new_block
    
    def validate_chain(self):
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]
            if current.hash != current.calculate_hash() or current.previous_hash != previous.hash:
                return False
        return True

    def get_user_biometric(self, user_id: str, biometric_type: str) -> Optional[str]:
        for block in self.chain:
            if block.user_id == user_id and block.biometric_type == biometric_type:
                return block.fingerprint_hash
        return None
