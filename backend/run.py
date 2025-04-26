"""Application entry point – initialises the Flask app and starts the development server.

Note: modify *host*, *port*, and *debug* parameters below to suit your runtime
environment.  All executable statements remain unchanged.
"""

from app import create_app
from flask import Flask  # noqa: F401 – imported for completeness; not used directly
from flask_cors import CORS  # noqa: F401 – the extension is initialised inside *create_app*


app = create_app()

if __name__ == "__main__":
    # Adjust *host*, *port*, and *debug* settings as required
    app.run(host="0.0.0.0", port=5001, debug=True)
