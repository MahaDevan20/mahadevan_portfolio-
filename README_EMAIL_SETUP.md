# Email Setup Instructions

## Quick Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create a `.env` file:**
   - Copy `.env.example` to `.env`
   - Fill in your email credentials

3. **For Gmail users:**

   a. Enable 2-Step Verification on your Google Account:
      - Go to https://myaccount.google.com/security
      - Enable 2-Step Verification if not already enabled

   b. Generate an App Password:
      - Go to https://myaccount.google.com/apppasswords
      - Select "Mail" and "Other (Custom name)"
      - Enter "Portfolio Contact Form"
      - Copy the generated 16-character password
      - Paste it in your `.env` file as `MAIL_PASSWORD`

   c. Update your `.env` file:
      ```
      MAIL_USERNAME=your-email@gmail.com
      MAIL_PASSWORD=your-16-character-app-password
      RECIPIENT_EMAIL=your-email@gmail.com
      ```

4. **For Outlook/Hotmail users:**

   Update your `.env` file:
   ```
   MAIL_SERVER=smtp-mail.outlook.com
   MAIL_PORT=587
   MAIL_USE_TLS=True
   MAIL_USERNAME=your-email@outlook.com
   MAIL_PASSWORD=your-password
   RECIPIENT_EMAIL=your-email@outlook.com
   ```

5. **Run your Flask app:**
   ```bash
   python app.py
   ```

## Testing

1. Go to your portfolio website
2. Scroll to the Contact section
3. Fill out the contact form
4. Submit the form
5. Check your email inbox for the message

## Troubleshooting

- **"Authentication failed" error:**
  - Make sure you're using an App Password for Gmail (not your regular password)
  - Verify 2-Step Verification is enabled

- **"Connection refused" error:**
  - Check your firewall settings
  - Verify SMTP server and port are correct

- **Email not received:**
  - Check your spam folder
  - Verify RECIPIENT_EMAIL is correct
  - Check Flask console for error messages

## Security Note

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore` (if you have one)
- Keep your App Password secure

