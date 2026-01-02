# QuizMaster - Online Quiz Application

A comprehensive MERN stack quiz application with role-based authentication, real-time quiz taking, and detailed analytics.

## Features

### For Students
- User registration and authentication
- Browse available quizzes
- Take timed quizzes with intuitive interface
- View instant results with detailed feedback
- Track quiz history and performance
- Responsive design for all devices

### For Admins/Lecturers
- Create and manage quizzes
- Add multiple choice questions with customizable options
- Set time limits and pass marks
- Publish/unpublish quizzes
- View detailed analytics and student performance
- Track quiz attempts and statistics

### Technical Features
- JWT-based authentication
- Role-based access control
- Real-time countdown timer
- Auto-submit on time expiry
- Progress tracking during quiz
- Comprehensive analytics dashboard
- Responsive UI with smooth animations

## Tech Stack

### Frontend
- React 18 with Hooks
- React Router for navigation
- Framer Motion for animations
- Lucide React for icons
- Custom CSS with CSS Variables
- Axios for API calls

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd online-quiz-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MongoDB URI and JWT secret:
   ```
   MONGODB_URI=mongodb://localhost:27017/quizapp
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   
   Start the backend server:
   ```bash
   npm run server
   ```
   
   In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Usage

### Getting Started
1. Register as either a Student or Admin
2. Login with your credentials

### For Admins
1. Go to Dashboard → Create Quiz
2. Fill in quiz details (title, description, time limit, etc.)
3. Add questions with multiple choice options
4. Mark correct answers and set point values
5. Publish the quiz when ready
6. View analytics to track student performance

### For Students
1. Browse available quizzes from the Quiz List
2. Click "Start Quiz" to begin
3. Read instructions carefully
4. Answer questions within the time limit
5. Submit quiz to see results
6. Review correct/incorrect answers

## Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "student" | "admin",
  timestamps
}
```

### Quiz Collection
```javascript
{
  title: String,
  description: String,
  category: String,
  timeLimit: Number (minutes),
  passMark: Number (percentage),
  isPublished: Boolean,
  createdBy: ObjectId (User),
  questions: [{
    questionText: String,
    options: [String],
    correctAnswer: Number (index),
    marks: Number
  }],
  timestamps
}
```

### Attempt Collection
```javascript
{
  userId: ObjectId (User),
  quizId: ObjectId (Quiz),
  answers: Map (questionIndex -> answerIndex),
  score: Number,
  totalMarks: Number,
  percentage: Number,
  timeTaken: Number (seconds),
  passed: Boolean,
  timestamps
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Quizzes
- `GET /api/quiz` - Get quizzes (filtered by role)
- `GET /api/quiz/:id` - Get specific quiz
- `POST /api/quiz` - Create quiz (admin only)
- `PUT /api/quiz/:id` - Update quiz (admin only)
- `DELETE /api/quiz/:id` - Delete quiz (admin only)

### Quiz Attempts
- `POST /api/attempt/submit` - Submit quiz attempt

### Analytics
- `GET /api/stats/dashboard` - Dashboard statistics
- `GET /api/analytics/:quizId` - Detailed quiz analytics

## Key Features Implementation

### Security
- Password hashing with bcryptjs
- JWT token authentication
- Role-based route protection
- Input validation and sanitization

### User Experience
- Intuitive quiz-taking interface
- Real-time countdown timer
- Progress indicators
- Smooth page transitions
- Mobile-responsive design

### Analytics
- Comprehensive quiz performance metrics
- Question-level analytics
- Student attempt tracking
- Pass/fail rate calculations

## Development Notes

### Code Organization
- Modular component structure
- Custom hooks for state management
- Reusable UI components
- Clean separation of concerns

### Styling
- CSS Variables for consistent theming
- Responsive grid layouts
- Smooth animations with Framer Motion
- Accessible color schemes

### Performance
- Efficient database queries
- Optimized React rendering
- Lazy loading where appropriate
- Minimal bundle size

## Future Enhancements

- Question types (True/False, Short Answer)
- Quiz categories and filtering
- Bulk question import
- Email notifications
- Advanced analytics charts
- Quiz templates
- Student progress tracking
- Certificate generation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
