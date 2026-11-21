import os

# Disable C extensions on Windows environments with Application Control policies
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"
