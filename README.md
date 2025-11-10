Pranayama Trainer

This project is a real-time pranayama (breathing exercise) guide that uses your webcam to analyze your posture and provide live feedback.

It works by connecting a React frontend (what you see in the browser) to a Python backend (which runs the pose estimation model).

Prerequisites

Before you begin, make sure you have the following installed on your computer:

Node.js (which includes npm): Download Node.js

Python 3: Download Python (Make sure to check "Add Python to PATH" during installation)

How to Run the Project

You must run the Backend first, and then run the Frontend. This requires two separate terminals.

Backend Setup (Python Server)
This server is responsible for analyzing your webcam feed.

Open your Terminal (Command Prompt, PowerShell, etc.).

Navigate to the Backend Folder:

Example:
cd path/to/your/backend_folder

Install Python Dependencies:

pip install websockets opencv-python mediapipe numpy

Run the Server:

python app.py

You should see the message: WebSocket server started at ws://localhost:8765. Leave this terminal running.

Frontend Setup (React App)
This is the website you will interact with.

Open a new, second Terminal.

Navigate to the Frontend Project Folder (the one with package.json):

Example:
cd path/to/your/frontend_project

Install Node.js Dependencies:

npm install

Run the React App:

npm run dev

or
npm start

This will automatically open the project in your web browser.

How to Use

Make sure both the Backend and Frontend servers are running.

Open the website in your browser.

Set your desired time and click the Start button.

Allow the browser to access your webcam when prompted.

The live feed and feedback will appear on the screen.
