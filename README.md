# 🚀 PrepPilot

**PrepPilot** is an intelligent interview preparation platform designed to help developers track their coding practice, analyze their progress, and receive AI-powered guidance for technical interviews.

## ✨ Features

### 📊 **Dashboard**
- Real-time statistics (total questions, solved, pending)
- Recent activity feed with completion tracking
- Active goals with progress visualization
- Weekly activity insights

### ❓ **Questions Management**
- Add custom coding questions with difficulty levels
- Tag questions by topics (Arrays, DP, Graphs, etc.)
- Track question status (To-Do, In Progress, Done)
- Filter and search by difficulty, tags, and status
- Direct links to LeetCode/coding platforms

### 📋 **Sheets (Collections)**
- Organize questions into themed sheets
- Bulk question management
- View all questions in a sheet with details
- Edit and delete sheet operations
- Track completion progress per sheet

### 🎯 **Goals Tracking**
- Set and track coding goals with deadlines
- Monitor goal progress in real-time
- Visual progress indicators
- Active vs completed goals management

### 📈 **Progress Analytics**
- Weekly activity bar charts
- Difficulty-wise breakdown (Easy/Medium/Hard)
- Topic-wise progress statistics
- Success rate calculations
- Weak areas identification

### 🤖 **AI-Powered Chatbot**
- Personalized recommendations based on your progress
- Identifies your weak topics
- Suggests next questions to solve
- Provides stats on demand
- Draggable chat interface
- Context-aware responses using Google Gemini AI

## 🛠️ Tech Stack

### **Frontend**
- **React 19** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **Vite** - Build tool

### **Backend**
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - Database
- **Mongoose 9** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Google Generative AI** - AI chatbot integration

## 📁 Project Structure

```
PrepPilot/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable components (Navbar, Chatbot, etc.)
│   │   ├── pages/           # Page components (Dashboard, Questions, etc.)
│   │   ├── services/        # API service layer
│   │   ├── context/         # React context (Auth, DarkMode)
│   │   ├── assets/          # Static assets
│   │   └── App.jsx          # Main app component
│   ├── public/              # Public assets
│   └── package.json
│
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── config/          # Configuration (database)
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Auth, validation, error handling
│   │   ├── validators/      # Request validation schemas
│   │   ├── utils/           # Utility functions
│   │   └── index.js         # Entry point
│   ├── .env                 # Environment variables (not in repo)
│   └── package.json
│
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PrepPilot
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Create `.env` file in backend folder**
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Update API URL in frontend**
   - Open `frontend/src/services/api.js`
   - Set `baseURL` to `http://localhost:5000/api`

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on: `http://localhost:5000`

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`

3. **Access the Application**
   - Open browser and navigate to `http://localhost:5173`
   - Register a new account or login

## 🔑 Environment Variables

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/preppilot` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key_here` |
| `GEMINI_API_KEY` | Google Gemini API key for AI chatbot | `AIzaSy...` |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Sheets
- `GET /api/sheets` - Get all sheets
- `POST /api/sheets` - Create sheet
- `PUT /api/sheets/:id` - Update sheet
- `DELETE /api/sheets/:id` - Delete sheet

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Activity
- `GET /api/activity?completed=true` - Get activities (filtered)
- `POST /api/activity` - Log activity

### Analytics
- `GET /api/analytics/weekly` - Get weekly activity data
- `GET /api/analytics/difficulty` - Get difficulty breakdown
- `GET /api/analytics/topics` - Get topic-wise stats

### Chat (AI)
- `POST /api/chat` - Send message to AI chatbot

## 🎨 Features in Detail

### Smart Activity Tracking
The platform automatically logs your activity when you:
- Mark questions as done
- Update question status
- Complete goals

### AI Chatbot Capabilities
- **Weak Topics Analysis**: "What are my weak topics?"
- **Next Question Recommendation**: "What should I solve next?"
- **Progress Stats**: "How many questions have I solved?"
- **General Guidance**: Ask about coding concepts, strategies, etc.

### Progress Visualization
- Weekly activity charts showing solved questions
- Difficulty distribution (Easy/Medium/Hard)
- Topic-wise completion rates
- Success rate percentages

## 🔐 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS configuration

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License
This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author
Built with ❤️ by Sayan, for developers

## 🐛 Known Issues
- None currently reported

## 🔮 Future Enhancements
- [ ] Email notifications for goal deadlines
- [ ] Collaborative sheets with friends
- [ ] Import questions from LeetCode
- [ ] Mobile responsive design improvements
- [ ] Dark mode enhancements
- [ ] Export progress as PDF
- [ ] Integration with GitHub for code submissions

---

**Happy Coding! 🚀**
