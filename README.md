# Subscription System

A modern web application for tracking and managing subscription services.

## Features

- Dashboard with subscription overview
- Add, edit, and manage subscriptions
- Track payment dates and renewal cycles
- Generate subscription reports
- Responsive design with dark theme
- Accessibility compliant (WCAG AA)

## Technology Stack

- ASP.NET Core 9.0 (Razor Pages)
- Bootstrap 5
- Vanilla JavaScript (ES6+)
- CSS3 with custom design tokens

## Getting Started

### Prerequisites

- .NET 9.0 SDK or later
- A modern web browser

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Run the application:
   ```bash
   dotnet run
   ```
4. Open your browser to `https://localhost:5001`

## Project Structure

```
ASIGNAR_SubscriptionSystem/
??? Pages/              # Razor Pages
?   ??? Shared/        # Layout components
?   ??? Index.cshtml   # Dashboard
?   ??? Home.cshtml    # Landing page
?   ??? Reports.cshtml
?   ??? Settings.cshtml
?   ??? AddSubscription.cshtml
??? wwwroot/
?   ??? css/           # Stylesheets
?   ??? js/            # JavaScript modules
?   ??? data/          # Mock data
??? Models/            # Data models
```

## Development

### Design System

The project uses a centralized design token system in `_design-tokens.css` for:
- Color palette
- Spacing scale
- Typography system
- Border radius values
- Shadow system
- Transition timings

### Code Style

- JavaScript: ES6+ with strict mode
- CSS: BEM-inspired naming for components
- HTML: Semantic markup with ARIA labels
- Accessibility: WCAG AA compliance

## License

See LICENSE.md for details.
