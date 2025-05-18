# Task Reminder Application

A modern, multilingual task and reminder management application built with Next.js and Supabase.

## Features

### Task Management
- Create, edit, and delete tasks
- Set task priorities (Low, Medium, High)
- Categorize tasks (Work, Personal, Study, Sport, Other)
- Set due dates for tasks
- Mark tasks as completed
- Add detailed descriptions to tasks

### Reminders
- Create one-time and recurring reminders
- Support for different recurrence patterns:
  - Daily reminders
  - Weekly reminders (with specific day selection)
  - Monthly reminders (with specific date selection)
- Set end dates for recurring reminders
- Browser notifications for due reminders
- Priority levels and categories for reminders

### Statistics and Analytics
- Visual representation of task completion rates
- Task distribution by priority
- Task distribution by category
- Weekly task completion patterns
- Total tasks and reminders overview

### User Features
- User authentication with email
- User profile management
- Data persistence with Supabase backend
- Export data in JSON or CSV format

### Internationalization
- Full support for multiple languages:
  - Uzbek (uz)
  - Russian (ru)
  - English (en)
- Easy language switching
- Localized dates and times

### UI/UX Features
- Modern, responsive design
- Dark/Light theme support
- Smooth animations and transitions
- Interactive filters and sorting
- Toast notifications for actions
- Loading states and error handling

## Technology Stack

### Frontend
- Next.js 14 (React Framework)
- TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- Framer Motion for animations
- Lucide React for icons
- date-fns for date manipulation

### Backend
- Supabase for database and authentication
- PostgreSQL database
- Real-time subscriptions

### State Management
- React Context for global state
- Custom hooks for business logic

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn package manager
- Supabase account and project

### Installation

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
cd task-remind
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Set up environment variables:
Create a \`.env.local\` file in the root directory with the following variables:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
task-remind/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── profile/           # User profile page
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── task-manager.tsx  # Task management component
│   ├── reminder-form.tsx # Reminder creation form
│   └── ...               # Other components
├── lib/                  # Utility functions and configurations
│   ├── supabase.ts      # Supabase client configuration
│   ├── translation.ts    # Translation strings
│   └── ...              # Other utilities
├── hooks/               # Custom React hooks
├── public/             # Static assets
└── styles/            # Global styles
\`\`\`

## Database Schema

### Tasks Table
- id: string (primary key)
- title: string
- description: string (optional)
- completed: boolean
- created_at: timestamp
- due_date: timestamp (optional)
- priority: enum (low, medium, high)
- category: enum (work, personal, study, sport, other)
- user_id: string (foreign key)

### Reminders Table
- id: string (primary key)
- title: string
- description: string (optional)
- datetime: timestamp
- completed: boolean
- priority: enum (low, medium, high)
- category: enum (work, personal, study, sport, other)
- recurrence: jsonb (optional)
- original_id: string (optional, for recurring instances)
- user_id: string (foreign key)

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/) 