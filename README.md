# Subscription System

A modern web application for tracking and managing subscription services.

## Features

- Dashboard with subscription overview
- Add, edit, and manage subscriptions
- Track payment dates and renewal cycles
- Generate subscription analytics and reports
- Responsive design with dark theme
- Accessibility-compliant (WCAG AA)

## Technology Stack

- **JavaScript (ES6+)** – Client-side interactivity
- **HTML5** – Semantic structure
- **CSS3** – Custom styling and responsive design
- **C#** – Backend logic (if applicable, e.g., WebAPI)
- **Bootstrap 5** – UI components & layout (optional, if you use it)

## Getting Started

### Prerequisites

- Node.js & npm (for JS development)
- .NET SDK (only if compiling/running C# backend)
- A modern web browser

### Installation

1. Clone this repository:
    ```bash
    git clone https://github.com/kenzuu-cmd/kenzuu_subscriptionsystem.git
    ```
2. Navigate to the project directory:
    ```bash
    cd kenzuu_subscriptionsystem
    ```
3. *(If using Node.js or npm for build pipeline)*  
   Install dependencies:
    ```bash
    npm install
    ```
4. Start the server/frontend (choose based on your setup):
    - For static frontend:
        ```bash
        # Serve with your favorite web server, or open index.html
        ```
    - For .NET backend:
        ```bash
        # In the backend directory (if applicable)
        dotnet run
        ```
5. Open your browser at `http://localhost:5000` or the specified port.

## Project Structure

```
kenzuu_subscriptionsystem/
├── wwwroot/
│   ├── css/         # Stylesheets (including design tokens)
│   ├── js/          # JavaScript modules and scripts
│   ├── data/        # Local JSON/mock data
│   └── index.html   # Entry point
├── src/             # Source code (JS/CSS organization, optional)
├── Models/          # C# backend models (if any)
├── Controllers/     # C# backend controllers (if any)
├── README.md
└── LICENSE.md
```

## Development

### Design System

Custom design tokens in `css/_design-tokens.css` manage:
- Color palette
- Spacing scale
- Typography system
- Border radius
- Shadows and transitions

### Code Style

- **JavaScript:** ES6+, strict mode, modular structure
- **CSS:** BEM naming for components
- **HTML:** Semantic markup, ARIA attributes for accessibility (WCAG AA)

## License

See [LICENSE.md](LICENSE.md) for details.