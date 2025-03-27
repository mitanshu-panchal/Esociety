from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed_password = "$2b$12$IWOmX/I1Auntvd.dpev26.U3KQzRqjystdB2CW0LGV3jS/VdQnNhq"  # Replace with the actual hash from the database
print(pwd_context.verify("admin123", hashed_password))