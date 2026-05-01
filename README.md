# Object Counter Backend

A robust Node.js/Express backend for an Object Detection and Counting application. This backend handles image processing requests, manages detection history, and provides statistical summaries. It is designed with a clean architecture to allow easy integration with external AI APIs.

## 🚀 Features

- **Object Detection API**: Receives images and returns object detection data (labels, confidence, bounding boxes).
- **History Management**: Stores scan results in MongoDB for later review.
- **Statistics Dashboard**: Provides aggregated data such as total objects counted and daily scan summaries.
- **AI Service Layer**: Isolated logic for external AI API integration with built-in mock fallback.
- **Error Handling**: Global error handling middleware for consistent API responses.

## 🛠️ Technologies Used

- **Node.js & Express**: Web framework.
- **MongoDB & Mongoose**: Database and ODM.
- **Axios**: For external AI API communication.
- **Dotenv**: Environment variable management.
- **CORS**: Cross-Origin Resource Sharing.

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/HassanABahaa/object-detection.git
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   DB_LOCAL=mongodb://127.0.0.1:27017/object_counter
   MOOD=DEV
   
   # AI API Configuration
   AI_API_URL=your_ai_api_url_here
   AI_API_KEY=your_ai_api_key_here
   ```

4. **Run the server**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🛣️ API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/detect` | Analyze an image for objects. Expects `{ "image": "base64/url" }` |
| `GET` | `/detect/history` | Get the list of all previous scans. |
| `GET` | `/detect/stats` | Get summarized statistics (Total counts, distribution, metrics). |

## 🧠 AI Integration

The project uses a Service-based architecture for AI. All integration logic is located in `src/services/ai.service.js`. 
- If `AI_API_URL` is provided in `.env`, the system will attempt to call the external API.
- If the API is missing or fails, it automatically falls back to **Mock Data** to ensure the application remains functional during development.

---
Developed by [Hassan Bahaa](https://github.com/HassanABahaa)
