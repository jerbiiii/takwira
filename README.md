# Takwira Football Reservation Platform

## Overview

**Takwira** is a premium, full‑stack web application that enables users to book football fields, create and join tournaments, and manage reservations with a sleek, modern UI. The platform features:

- **Dynamic reservation calendar** with real‑time availability.
- **Tournament creation and subscription** flows.
- **Animated authentication experience** using `framer-motion`.
- **Responsive design** with dark‑mode support and glass‑morphism effects.
- **Robust backend** powered by Django (Python) and a REST API.

The goal is to provide a seamless, engaging experience for football enthusiasts while maintaining a clean, maintainable codebase.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind‑CSS (custom vanilla CSS for premium design), Framer Motion, React Router, Axios |
| Backend | Django (Python) – API endpoints for bookings, tournaments, authentication |
| Database | SQLite (development) – can be swapped for PostgreSQL in production |
| Styling | Vanilla CSS with modern design patterns (glass‑morphism, gradients, micro‑animations) |
| Deployment | Vite dev server (`npm run dev`), production build (`npm run build`), optional Docker |

---

## Getting Started

### Prerequisites

- **Node.js** (>= 20) and **npm**
- **Python** (>= 3.11) and **pip**
- **Git**

### Clone the Repository

```bash
git clone https://github.com/your‑org/takwira.git
cd "Marketing App"
```

### Backend Setup

```bash
# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations and start the server
python manage.py migrate
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`.

### Frontend Setup

```bash
cd takwira_frontend
npm install
npm run dev
```

The React app will be served at `http://localhost:5173/` and will automatically proxy API calls to the Django backend.

---

## Development Workflow

1. **Feature Branches** – Create a new branch for each feature or bug fix.
2. **Linting** – Run `npm run lint` (frontend) and `flake8` (backend) before committing.
3. **Testing** – Frontend unit tests with Jest; backend tests with Django's test suite.
4. **Commit Messages** – Follow Conventional Commits (`feat:`, `fix:`, `chore:` etc.).

---

## Building for Production

```bash
npm run build   # Generates optimized static assets in /dist
# Deploy the /dist folder with any static‑file server or integrate with Django's static handling.
```

---

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to submit pull requests, report bugs, and propose new features.

---

## License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---

## Screenshots

*(Add screenshots of the home page, booking modal, and tournament flow here – you can generate images with the `generate_image` tool if needed.)*

---

## Contact

For questions or feedback, reach out to the maintainers at `contact@takwira.io`.
