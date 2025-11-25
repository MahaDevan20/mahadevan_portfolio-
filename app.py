from flask import Flask, render_template, send_file, request, jsonify
from flask_mail import Mail, Message
import os
import re
import logging
import html
from datetime import datetime, timedelta
from collections import defaultdict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('portfolio.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Environment-based configuration
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true' if FLASK_ENV == 'development' else False

# Email configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', '')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', '')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME', '')

# Your email where you want to receive messages
RECIPIENT_EMAIL = os.getenv('RECIPIENT_EMAIL', os.getenv('MAIL_USERNAME', ''))

# Rate limiting configuration
RATE_LIMIT_ENABLED = os.getenv('RATE_LIMIT_ENABLED', 'True').lower() == 'true'
RATE_LIMIT_MAX_REQUESTS = int(os.getenv('RATE_LIMIT_MAX_REQUESTS', 5))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv('RATE_LIMIT_WINDOW_SECONDS', 300))

# Rate limiting storage (in-memory, for production consider Redis)
rate_limit_store = defaultdict(list)

# Validate configuration on startup
def validate_config():
    """Validate required configuration on startup"""
    errors = []
    
    if not app.config['MAIL_USERNAME']:
        errors.append("MAIL_USERNAME is not set")
    if not app.config['MAIL_PASSWORD']:
        errors.append("MAIL_PASSWORD is not set")
    if not RECIPIENT_EMAIL:
        errors.append("RECIPIENT_EMAIL is not set")
    
    if errors and FLASK_ENV == 'production':
        logger.error("Configuration errors: " + ", ".join(errors))
        raise ValueError("Missing required configuration: " + ", ".join(errors))
    elif errors:
        logger.warning("Configuration warnings: " + ", ".join(errors))

validate_config()

mail = Mail(app)

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

def is_valid_email(email):
    """Validate email format"""
    return bool(EMAIL_REGEX.match(email))

def sanitize_input(text, max_length=5000):
    """Sanitize user input to prevent XSS attacks"""
    if not text:
        return ""
    # Remove any HTML tags and escape special characters
    text = html.escape(text)
    # Limit length
    if len(text) > max_length:
        text = text[:max_length]
    return text

def check_rate_limit(ip_address):
    """Check if IP address has exceeded rate limit"""
    if not RATE_LIMIT_ENABLED:
        return True
    
    now = datetime.now()
    # Clean old entries
    rate_limit_store[ip_address] = [
        timestamp for timestamp in rate_limit_store[ip_address]
        if now - timestamp < timedelta(seconds=RATE_LIMIT_WINDOW_SECONDS)
    ]
    
    # Check if limit exceeded
    if len(rate_limit_store[ip_address]) >= RATE_LIMIT_MAX_REQUESTS:
        return False
    
    # Add current request
    rate_limit_store[ip_address].append(now)
    return True

def get_client_ip():
    """Get client IP address"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    return request.remote_addr or 'unknown'

@app.route("/")
def home():
    return render_template("portfolio.html")

@app.route("/download-resume")
def download_resume():
    resume_path = os.path.join(app.root_path, 'static', 'files', 'updated_Resume.pdf')
    return send_file(resume_path, as_attachment=True, download_name='Mahadevan_Nair_Resume.pdf')

@app.route("/contact", methods=['POST'])
def contact():
    client_ip = get_client_ip()
    
    try:
        # Check rate limiting
        if not check_rate_limit(client_ip):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return jsonify({
                'success': False,
                'message': 'Too many requests. Please try again later.'
            }), 429
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'Invalid request data.'
            }), 400
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        message = data.get('message', '').strip()
        
        # Validate input
        if not name or not email or not message:
            return jsonify({
                'success': False,
                'message': 'Please fill in all fields.'
            }), 400
        
        # Validate name length
        if len(name) < 2 or len(name) > 100:
            return jsonify({
                'success': False,
                'message': 'Name must be between 2 and 100 characters.'
            }), 400
        
        # Validate email format
        if not is_valid_email(email):
            return jsonify({
                'success': False,
                'message': 'Please enter a valid email address.'
            }), 400
        
        # Validate message length
        if len(message) < 10 or len(message) > 5000:
            return jsonify({
                'success': False,
                'message': 'Message must be between 10 and 5000 characters.'
            }), 400
        
        # Sanitize inputs to prevent XSS
        name = sanitize_input(name, max_length=100)
        email = sanitize_input(email, max_length=255)
        message = sanitize_input(message, max_length=5000)
        
        # Create email message
        msg = Message(
            subject=f'Portfolio Contact Form - Message from {name}',
            recipients=[RECIPIENT_EMAIL],
            body=f'''
You have received a new message from your portfolio contact form.

Name: {name}
Email: {email}
IP Address: {client_ip}
Timestamp: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

Message:
{message}

---
This message was sent from your portfolio website.
            ''',
            reply_to=email
        )
        
        # Send email
        mail.send(msg)
        logger.info(f"Contact form submitted successfully from {email} (IP: {client_ip})")
        
        return jsonify({
            'success': True,
            'message': 'Thank you for your message! I will get back to you soon.'
        }), 200
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)} (IP: {client_ip})")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error sending email: {str(e)} (IP: {client_ip})", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Sorry, there was an error sending your message. Please try again later or contact me directly at mahadevannair16@gmail.com'
        }), 500

@app.errorhandler(404)
def not_found(error):
    logger.warning(f"404 error: {request.url}")
    return render_template("portfolio.html"), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 error: {str(error)}", exc_info=True)
    return jsonify({
        'success': False,
        'message': 'An internal error occurred. Please try again later.'
    }), 500

if __name__ == "__main__":
    # Use PORT environment variable when provided (Render sets $PORT)
    port = int(os.getenv('PORT', 5001))
    if FLASK_ENV == 'production':
        logger.info("Starting Flask app in PRODUCTION mode")
        app.run(debug=False, host="0.0.0.0", port=port)
    else:
        logger.info("Starting Flask app in DEVELOPMENT mode")
        app.run(debug=FLASK_DEBUG, host="0.0.0.0", port=port)
