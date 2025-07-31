# Budget Planner App

A full-stack budget planning application built with React, TypeScript, and Supabase. This app uses a **bank-balance-based budgeting method** that focuses on your actual bank balance rather than monthly projections.

## 🎨 Features

### Core Functionality
- **User Authentication** - Secure sign up and login with Supabase Auth
- **Bank Balance Tracking** - Input and update your current bank balance
- **Pay Frequency Management** - Set how often you get paid (weekly, biweekly, monthly, custom)
- **Recurring Income & Expenses** - Track regular income sources and bills
- **Savings Goals** - Set and track progress towards financial goals
- **Transaction Management** - Record and categorize one-time transactions
- **Smart Budget Forecasting** - See what you should have, what's reserved, and what's discretionary

### Budget Planning Features
- **Pay Cycle Awareness** - Budget planning based on your actual pay schedule
- **Bill Reservation** - Automatically reserve funds for upcoming bills
- **Discretionary Spending** - Clear view of money available for spending
- **Goal Tracking** - Monitor progress towards savings goals
- **AI Categorization** - Automatic transaction categorization with manual override

### UI/UX Features
- **Pixel Art Aesthetic** - Cozy 2D pixel-art inspired design
- **Rosé Pine Themes** - Beautiful dark (Classic) and light (Dawn) themes
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Pixel-style animations and transitions
- **Accessible** - Keyboard navigation and screen reader support

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom Rosé Pine theme
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Routing**: React Router DOM

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd budget-planner-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to your project dashboard
   - Copy your project URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Copy and paste the contents of `database-schema.sql`
   - Run the SQL to create all tables and policies

6. **Start the development server**
   ```bash
   npm start
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Database Schema

The app uses the following main tables:

- `users` - User profiles and authentication
- `user_settings` - Pay frequency, theme preferences, etc.
- `bank_balances` - Historical bank balance records
- `recurring_income` - Regular income sources
- `recurring_expenses` - Regular bills and expenses
- `goals` - Savings goals and targets
- `transactions` - One-time income and expenses

## 🎯 How It Works

### Bank Balance Based Budgeting
Unlike traditional zero-based budgeting, this app focuses on your actual bank balance:

1. **Input Current Balance** - Start with your real bank balance
2. **Set Pay Schedule** - Tell the app when you get paid
3. **Add Recurring Items** - Income sources and regular bills
4. **Smart Forecasting** - App calculates:
   - What you should have in the bank
   - How much is reserved for upcoming bills
   - How much is discretionary to spend
   - Whether you're on track for goals

### Pay Cycle Planning
The app uses your pay frequency to:
- Calculate budget cycles
- Reserve funds for bills beyond the current pay period
- Provide recommendations for early savings
- Prevent surprise shortfalls

## 🎨 Design System

### Color Palette
The app uses the Rosé Pine color palette:

**Dark Mode (Classic)**
- Base: `#191724` - Main background
- Surface: `#1f1d2e` - Card backgrounds
- Text: `#e0def4` - Primary text
- Pine: `#31748f` - Primary accent
- Gold: `#f6c177` - Secondary accent
- Love: `#eb6f92` - Error/warning

**Light Mode (Dawn)**
- Base: `#faf4ed` - Main background
- Surface: `#fffaf3` - Card backgrounds
- Text: `#575279` - Primary text
- Pine: `#286983` - Primary accent
- Gold: `#ea9d34` - Secondary accent
- Love: `#b4637a` - Error/warning

### Pixel Art Elements
- Sharp corners (no border-radius)
- Pixel-style shadows
- Simple geometric shapes
- Retro-inspired animations

## 🔮 Future Features

The following features are planned for future releases:

- [ ] **OCR Receipt Parsing** - Automatically extract transaction data from receipts
- [ ] **AI Budget Assistant** - OpenAI integration for budget advice
- [ ] **Plaid Integration** - Real-time bank data synchronization
- [ ] **Natural Language Interface** - Chat with your budget
- [ ] **Export/Import** - Backup and restore budget data
- [ ] **Mobile App** - Native iOS and Android apps
- [ ] **Multi-Currency Support** - International currency support
- [ ] **Budget Templates** - Pre-built budget categories and structures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Rosé Pine** - Beautiful color palette by [Rosé Pine](https://rosepinetheme.com/)
- **Supabase** - Amazing backend-as-a-service platform
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide** - Beautiful icon library
- **Stardew Valley** - Inspiration for the cozy pixel art aesthetic

## 📞 Support

If you have any questions or need help setting up the app, please:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages

---

**Happy Budgeting! 💰✨**
