#About

The Anonymous Local Business Support Network is a web application that allows users to anonymously review, recommend, and support local businesses. This platform encourages community engagement by providing businesses with valuable feedback while preserving user anonymity.

#Features

Anonymous Business Reviews: Users can add reviews without creating an account.\

Upvote & Downvote Reviews: Prevents spam using cookies and rate-limiting mechanisms.\

AI-Based Business Recommendations: Uses sentiment analysis and collaborative filtering (Surprise library) to suggest relevant businesses.\

Location-Based Filtering: Displays businesses within a certain radius of the user's location.\

Spam Prevention & Security: Implements Google reCAPTCHA, rate limiting, and IP-based request control.\

Interactive Map Integration: Uses Leaflet.js and OpenStreetMap API to visually display businesses.\

#Tech Stack

Frontend:\

HTML, CSS, JavaScript (with TailwindCSS for styling)\

Leaflet.js (for mapping and location services)\

Backend:\

Node.js with Express.js (for API management)\

MongoDB with Mongoose (for database management)\

Python (Surprise, Scikit-learn, Pandas, NumPy) (for AI-based recommendations)\

Google reCAPTCHA v2 (for spam prevention)
