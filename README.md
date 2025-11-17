# EDC Bills Manager

A modern, responsive web application for managing Electricity Distribution Company (EDC) bills. Track your electricity consumption, monitor payment status, and manage your bills efficiently.

## Features

- **Add Bills**: Easily add new electricity bills with detailed information
- **Track Consumption**: Monitor your electricity usage over time
- **Payment Status**: Keep track of paid, unpaid, and overdue bills
- **Statistics Dashboard**: View comprehensive statistics about your bills
- **Filter & Search**: Filter bills by payment status
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Local Storage**: All data is saved locally in your browser
- **Modern UI**: Clean and intuitive user interface with smooth animations

## Demo

Visit the live demo: [EDC Bills Manager](#)

## Screenshots

The application features:
- A clean dashboard with statistics cards
- An easy-to-use form for adding bills
- A comprehensive bills list with filtering options
- Responsive design that works on all devices

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Vanilla JavaScript with modern features
- **LocalStorage API**: For data persistence
- **Netlify**: Hosting and deployment

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (optional, for local development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Pritesh2809/edc-bills.git
   cd edc-bills
   ```

2. Install dependencies (optional):
   ```bash
   npm install
   ```

3. Run locally:
   ```bash
   npm run dev
   ```
   Or simply open `public/index.html` in your browser.

## Deployment to Netlify

### Option 1: Deploy from Git Repository

1. Push your code to GitHub, GitLab, or Bitbucket
2. Log in to [Netlify](https://www.netlify.com/)
3. Click "Add new site" > "Import an existing project"
4. Connect your Git provider and select the repository
5. Configure build settings:
   - **Build command**: (leave empty or use `echo 'No build needed'`)
   - **Publish directory**: `public`
6. Click "Deploy site"

### Option 2: Manual Deploy

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod --dir=public
   ```

### Option 3: Drag and Drop

1. Build your project (if needed)
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag and drop the `public` folder

## Project Structure

```
edc-bills/
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Styling
│   ├── app.js          # Application logic
│   └── _redirects      # Netlify redirects
├── netlify.toml        # Netlify configuration
├── package.json        # Project metadata
├── .gitignore         # Git ignore rules
└── README.md          # Documentation
```

## Usage

### Adding a Bill

1. Fill in the form with bill details:
   - Billing Month
   - Consumer Number
   - Units Consumed (in kWh)
   - Bill Amount (in dollars)
   - Due Date
   - Payment Status

2. Click "Add Bill" to save

### Managing Bills

- **Update Status**: Use the dropdown in each bill card to change payment status
- **Delete Bill**: Click the "Delete" button on any bill card
- **Filter Bills**: Use the status filter dropdown to view specific types of bills
- **Clear All**: Remove all bills using the "Clear All" button

### Viewing Statistics

The statistics dashboard shows:
- Total number of bills
- Total amount of all bills
- Number of unpaid bills
- Average electricity consumption

## Data Storage

All data is stored locally in your browser using the LocalStorage API. This means:
- Your data is private and stays on your device
- No server or database required
- Data persists between sessions
- Clearing browser data will remove your bills

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Design inspired by modern web application patterns
- Built with vanilla JavaScript for maximum compatibility
- Optimized for Netlify deployment

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

## Roadmap

Future enhancements planned:
- Export bills to CSV/PDF
- Charts and graphs for consumption analysis
- Email notifications for due dates
- Multiple consumer accounts support
- Dark mode
- Bill payment history
- Recurring bill templates

---

Made with care for better bill management.
