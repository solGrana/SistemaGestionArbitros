from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL                 = os.getenv("DATABASE_URL", "sqlite:///./arbitros.db")
SECRET_KEY                   = os.getenv("SECRET_KEY", "dev_secret")
ALGORITHM                    = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES  = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
REFRESH_TOKEN_EXPIRE_MINUTES = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", 1440))
