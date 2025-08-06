Run the frontend:
1. Open PowerShell and write: npm install.
2. Write: npm run dev
Run the backend:
1. Choose directory /src/backend
2. Create a .env file, add variables DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, WEATHER_API_KEY and give a string to them.
3. Write: uvicorn db_connect:app --reload
