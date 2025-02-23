from fastapi import HTTPException, status
import hashlib
from optimizedbackend.blockchain import Blockchain

blockchain = Blockchain()

def hash_biometric(biometric_data: str) -> str:
    return hashlib.sha256(biometric_data.encode()).hexdigest()

def register_biometric(user_id: str, biometric_data: str, biometric_type: str):
    if not user_id or not biometric_data or not biometric_type:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid input data")
    biometric_hash = hash_biometric(biometric_data)
    blockchain.add_block(user_id, biometric_type, biometric_hash)
    return biometric_hash

def verify_biometric(user_id: str, biometric_data: str, biometric_type: str):
    if not user_id or not biometric_data or not biometric_type:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid input data")
    stored_hash = blockchain.get_user_biometric(user_id, biometric_type)
    if not stored_hash:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Biometric not registered")
    input_hash = hash_biometric(biometric_data)
    if stored_hash != input_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Biometric mismatch")
    return True
