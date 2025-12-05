# Travel Quotation Assistant - AAHAAS

A modern, responsive React web application for AI-powered travel quotation assistance with authentication and real-time chat functionality.

## ⚠️ Getting "Failed to fetch" Error?

**Quick Fix:** Double-click `enable-demo-mode.bat` to test the frontend without backend.

**Full Solutions:** See `ERROR_SOLUTION.md`

## 📚 Documentation Guide

- **`ERROR_SOLUTION.md`** - Solutions for "Failed to fetch" error
- **`QUICK_FIX.md`** - Quick reference for common issues
- **`TROUBLESHOOTING.md`** - Detailed troubleshooting guide
- **`SETUP_GUIDE.md`** - Complete setup and testing instructions
- **`CHANGES.md`** - List of recent code changes

## Features

### Authentication
- **Login Page**: Secure login with email and password
- **Register Page**: User registration with validation
- **Protected Routes**: Only authenticated users can access the assistant
- **Persistent Sessions**: User sessions are maintained across browser sessions

### Travel Quotation Assistant
- **AI-Powered Chat**: Interactive chat interface with intelligent travel assistant
- **Multiple Conversations**: Create and manage multiple chat sessions
- **Chat History**: View and resume previous conversations
- **Real-time Responses**: Get instant travel quotations and recommendations
- **Session Management**: Each chat has its own session ID for context preservation

### Design
- **Modern UI**: Clean, professional design with smooth animations
- **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Consistent Styling**: Uniform design language across all pages
- **User-Friendly**: Intuitive navigation and interaction patterns

## Technology Stack

- **React 18**: Modern React with hooks
- **React Router 6**: Client-side routing
- **Context API**: State management
- **CSS3**: Custom styling with modern CSS features
- **Font Awesome**: Icon library
- **Google Fonts**: Inter font family

## API Integration

### Backend APIs
- **Base URL**: `https://stagev2.appletechlabs.com/api`
- **Authentication**: Login, Register, Logout, Refresh, User Info
- **Booking**: Save and retrieve travel bookings
- **Quotation**: List and view quotations
- **Content**: Places, hotels, attractions, and more

### AI Assistant
- **Webhook URL**: `https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147`
- **Purpose**: Processes travel queries and returns quotations
- **Features**: Natural language processing for travel planning

## Installation

1. **Prerequisites**
   ```bash
   Node.js (v14 or higher)
   npm or yarn
   ```

2. **Install Dependencies**
   ```bash
   cd Travel_Quotation_Assistant
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```
   The application will open at `http://localhost:3000`

4. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
Travel_Quotation_Assistant/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── context/
│   │   └── AuthContext.js      # Authentication context provider
│   ├── pages/
│   │   ├── LoginPage.jsx       # Login page component
│   │   ├── LoginPage.css       # Login page styles
│   │   ├── RegisterPage.jsx    # Register page component
│   │   ├── RegisterPage.css    # Register page styles
│   │   ├── TravelQuotationPage.jsx   # Main assistant page
│   │   └── TravelQuotationPage.css   # Assistant page styles
│   ├── services/
│   │   └── api.js              # API service functions
│   ├── App.js                  # Main app component with routing
│   ├── App.css                 # Global app styles
│   ├── index.js                # React entry point
│   └── index.css               # Global styles
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## Usage Guide

### 1. Register a New Account
- Navigate to the register page (`/register`)
- Fill in username, email, and password
- Accept terms and conditions
- Click "Create Account"

### 2. Login
- Navigate to the login page (`/login`)
- Enter your email and password
- Optionally check "Remember me"
- Click "Sign In"

### 3. Using the Travel Assistant
- After login, you'll be redirected to the assistant (`/assistant`)
- Click "New Chat" to start a new conversation
- Type your travel requirements (e.g., "10 days in Japan for 2 people")
- Press Enter or click "Send"
- Wait for the AI assistant to process your request
- View your quotation number and details

### 4. Managing Chats
- View all previous chats in the sidebar
- Click on any chat to resume the conversation
- Delete unwanted chats using the delete button
- Each chat maintains its own context

### 5. Logout
- Click the "Logout" button in the sidebar footer
- You'll be redirected to the login page

## Features in Detail

### Form Validation
- **Email**: Must be valid email format
- **Password**: Minimum 8 characters with uppercase, lowercase, and number
- **Real-time Feedback**: Instant validation messages
- **Error Handling**: Clear error messages for failed operations

### Responsive Design
- **Desktop**: Full sidebar with chat history
- **Tablet**: Collapsible sidebar
- **Mobile**: Hamburger menu for navigation
- **Adaptive Layouts**: Content adjusts to screen size

### Chat Features
- **Auto-scroll**: Messages automatically scroll into view
- **Typing Indicator**: Shows when assistant is processing
- **Message Types**: User, assistant, info, success, and error messages
- **Session Persistence**: Chats are saved in localStorage
- **Timestamps**: All messages include timestamps

### Security
- **Protected Routes**: Authentication required for assistant
- **Token Storage**: Secure token storage in localStorage
- **Automatic Logout**: Session management
- **HTTPS APIs**: Secure communication with backend

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh auth token
- `GET /api/auth/me` - Get user info

### Booking
- `POST /api/booking/save` - Save booking
- `POST /api/booking/retrieve` - Retrieve booking

### Quotation
- `GET /api/quotation/list` - List quotations
- `GET /api/quotation/view/pnl` - View PNL

### Content
- `GET /api/content/place` - Get places
- `GET /api/content/hotel` - Get hotels
- And more...

## Customization

### Changing Colors
Edit the CSS files to change the color scheme:
- Primary Color: `#004e64`
- Secondary Color: `#006582`
- Success Color: `#10b981`
- Error Color: `#ef4444`

### Adding New Features
1. Create new components in `src/components/`
2. Add new routes in `App.js`
3. Add API functions in `src/services/api.js`

### Modifying API URLs
Edit `src/services/api.js`:
```javascript
const API_BASE_URL = 'your-api-url';
const WEBHOOK_URL = 'your-webhook-url';
```

## Troubleshooting

### Common Issues

1. **Cannot start the app**
   - Make sure all dependencies are installed: `npm install`
   - Check Node.js version: `node --version`

2. **Login fails**
   - Verify API URL is correct
   - Check network connectivity
   - Ensure backend API is running

3. **Chat not responding**
   - Check webhook URL configuration
   - Verify network connectivity
   - Check browser console for errors

4. **Styles not loading**
   - Clear browser cache
   - Restart development server
   - Check CSS file imports

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization

- **Code Splitting**: React Router lazy loading
- **Image Optimization**: Optimized background images
- **Caching**: LocalStorage for chat history
- **Minification**: Production build optimization

## Future Enhancements

- Google OAuth integration
- Email verification
- Password reset functionality
- File attachments in chat
- Export chat history
- Dark mode
- Multi-language support
- Push notifications

## License

This project is proprietary software for AAHAAS Travel Services.

## Support

For issues or questions, please contact the development team.

## Acknowledgments

- Design inspiration from modern travel platforms
- Icons by Font Awesome
- Fonts by Google Fonts
- Background images from Unsplash
