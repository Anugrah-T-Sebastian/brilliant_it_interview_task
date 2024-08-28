# Brilliant IT Interview Task

## Environment Setup

### Backend server

1. Install the lastest Node.js and NPM versions
2. Navigate to `backend_server` directory from the `brilliant_it_interview_task` directory.
   ```
   cd backend_server
   ```
3. Install server dependencies.
   ```
   npm install
   ```
4. In the `.env` file insert the OpenAI API key against the value `OPENAI_API_KEY`.
   ```
   OPENAI_API_KEY=xxxxxxxxxxxxxxxxxxxx
   ```
5. Start the backend server
   ```
   npm start
   ```

The backend server should now be running locally on port 3003.

### Frontend React App

1. Navigate to `react-app-interview-task` directory from the `brilliant_it_interview_task` directory.
   ```
   cd react-app-interview-task
   ```
2. Install application dependencies
   ```
   npm install
   ```
3. Start the application live server
   ```
   npm start
   ```

The frontend web app should now be running on `http://localhost:3000`

### Python Script

1. Navigate to `python_script` directory from the `brilliant_it_interview_task` directory.
   ```
   cd python_script
   ```
2. Create a virtual python environment
   ```
   python -m venv env
   ```
3. Activate Virtual Environment **For MacOS**
   ```
   source env/bin/activate  # On Unix or MacOS
   ```
   or **For Windows**
   ```
   env/Scripts/activate  # On Windows
   ```
4. Install Libraries from `requirements.txt`
   ```
   pip install -r requirements.txt
   ```
5. Enter the OpenAI, Pinecone and Claude API keys in the `rag_system.py` file.
   ```
   openai.api_key = "OPENAI_API_KEY"
   pinecone_api_key = "PINECONE_API_KEY"
   pinecone_environment = "PINECONE_ENVIRONMENT"
   claude_api_key = "CLAUDE_API_KEY"
   ```
6. Run the `rag_system.py` file
   ```
   python3 rag_system.py
   ```

## Developement Approach

### Backend server

1. The developement was done use Express.js. The client configuration for OpenAI and Pinecone was done using the API keys. Pinecone client adding was done using a middleware.
2. The backend server receives PDF/Txt files using a post request on `/api/v1/upload` endpoint. Multipart form is used to recover the uploaded files and the corresponding Meta data.
3. The uploaded files are stored locally on the backend server (for now due to lack of cloud storage). The files are then loaded into OpenAI vector embedding in forms of chunks.
4. The vector embedding were then upserted into Pinecone database in batches.
5. Similarly, the user question is received through a POST request on the `/api/v1/query` endpoint. The user question is recovered from the POST request and embedded into the vector.
6. The embedded query is the matched to Pinecone entries. The matched documents are recovered and passed to the OpenAI LLM to get the answer to the user question.
7. The answer is then given to the frontend as a response.

**Challenges**

- Lack of OpenAI API key made limited the number of request made.Thus limiting the requriement for thorough testing.

### Frontend application

1. The React application was broken into `<FileUpload />`, `<QuestionForm />` and `<ResponseDisplay />` components.
2. The `<FileUpload />` component allows the user to add files using a drap&drop mechanism. It also sends the file to the backend server using `axios` library to the `/api/v1/upload` endpoint using a POST request.
3. `<QuestionForm />` lets the user input the question and send the question to the backend server to the `/api/v1/query` endpoint.
4. `<ResponseDisplay />` take the response to the POST request made by the `<QuestionForm />` and displays it to the user.
