# SSC TenthOverflow

A comprehensive StackOverflow-style platform for SSC (Secondary School Certificate) students to ask questions, get answers, access past papers, and interact with an AI chatbot.

## Features

- **Q&A Platform**: Ask questions and get answers from the community
- **AI Chatbot**: Intelligent assistant for student queries
- **Past Papers Repository**: Web-scraped and organized past papers
- **User Authentication**: Secure login and registration system
- **Search Functionality**: Find questions, answers, and past papers
- **Voting System**: Upvote/downvote questions and answers
- **Tags System**: Categorize questions by subjects and topics
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

### Backend (.NET)
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server Database
- JWT Authentication
- OpenAI API Integration (for chatbot)
- Web Scraping (for past papers)

### Frontend (React)
- React 18 with TypeScript
- Material-UI (MUI) for components
- React Router for navigation
- Axios for API calls
- React Query for state management

## Project Structure

```
sscoverflow/
├── backend/                 # .NET Web API
│   ├── SSCOverflow.API/
│   ├── SSCOverflow.Core/
│   ├── SSCOverflow.Infrastructure/
│   └── SSCOverflow.Application/
├── frontend/               # React Application
│   ├── src/
│   ├── public/
│   └── package.json
├── database/              # Database scripts and migrations
└── docs/                  # Documentation
```

## Getting Started

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+ and npm
- SQL Server (or SQL Server Express)
- Visual Studio 2022 or VS Code

### Backend Setup
1. Navigate to the backend directory
2. Update connection string in `appsettings.json`
3. Run migrations: `dotnet ef database update`
4. Start the API: `dotnet run`

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create new question
- `GET /api/questions/{id}` - Get question by ID
- `POST /api/answers` - Post answer
- `POST /api/chat` - AI chatbot endpoint
- `GET /api/past-papers` - Get past papers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License 