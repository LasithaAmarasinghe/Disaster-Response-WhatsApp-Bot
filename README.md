# Disaster Response WhatsApp Bot 🚨

A complete WhatsApp monitoring and disaster response management system designed to track emergency requests from WhatsApp groups during floods and landslides in Sri Lanka.

## 🎯 Purpose

During disasters like floods and landslides in Sri Lanka, people post urgent needs in WhatsApp groups. This system provides:
- **WhatsApp Bot** - Monitors groups and extracts critical information
- **API Server** - Receives and stores standardized reports
- **Web Dashboard** - Beautiful real-time interface to view and manage requests
- **Multi-language Support** - Processes English, Sinhala, and Tamil messages
- **Smart Parsing** - Automatically detects needs, locations, contacts, and urgency
- **Local Backup** - Never loses data even if systems go down

## 🚀 Features

### WhatsApp Bot
- **Multi-language Support**: Processes messages in English, Sinhala, and Tamil
- **Smart Information Extraction**:
  - Request type (food, water, shelter, medical, rescue, transport, clothing)
  - Urgency level (high, medium, low)
  - Locations (25 districts + major cities)
  - Contact phone numbers (auto-normalized to +94 format)
  - Sender information and timestamps
- **Flexible Configuration**: Monitor specific groups or all groups
- **Auto-skip Own Messages**: Only tracks messages from others
- **Local Backup**: Saves reports when API is unavailable

### API Server & Dashboard
- **RESTful API**: Receives and stores disaster reports
- **Beautiful Web Dashboard**: Modern, responsive interface
- **Real-time Updates**: Auto-refreshes every 5 seconds
- **Advanced Filtering**: Filter by type, urgency, or search keywords
- **Statistics Overview**: Track totals by category and urgency
- **Delete Function**: Remove non-important reports with one click
- **Persistent Storage**: Saves reports to JSON files

## 📋 Requirements

- Node.js 18+ (with ES modules support)
- WhatsApp account
- Internet connection

## 🔧 Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
```bash
copy .env.example .env
```

Edit `.env` file:
```env
# Your API endpoint URL
API_ENDPOINT=https://your-api-endpoint.com/api/disaster-reports

# Optional: API authentication key
API_KEY=your_api_key_here

# Groups to monitor (comma-separated, partial names work)
# Leave empty to monitor ALL groups
```
## 🏃 Usage

### Start the System

You need **two terminals** running:

**Terminal 1 - API Server & Dashboard:**
```bash
npm run server
```
- API runs on http://localhost:3000
- Dashboard available at http://localhost:3000

**Terminal 2 - WhatsApp Bot:**
```bash
npm start
```

### First Time Setup

1. **Start the bot** (Terminal 2):
   - A QR code will appear in the terminal
   - Open WhatsApp on your phone
   - Go to Settings > Linked Devices > Link a Device
   - Scan the QR code

2. **Open Dashboard** (Browser):
   - Navigate to http://localhost:3000
   - You'll see the real-time dashboard

3. **Bot is ready**:
   - The bot monitors your configured groups
   - Relevant messages are automatically processed
   - Reports appear instantly on the dashboard
   - Check both terminals for logs

### Using the Dashboard

- **Filter Reports**: Use dropdowns to filter by type or urgency
- **Search**: Type to search locations, contacts, or message content
- **Delete Reports**: Click the red ✕ button on non-important reports
- **Auto-refresh**: Dashboard updates every 5 seconds automatically
- **Statistics**: View totals at the top (total, high urgency, by category)in the terminal
   - Open WhatsApp on your phone
   - Go to Settings > Linked Devices > Link a Device
   - Scan the QR code

3. **Bot is ready**:
   - The bot will monitor configured groups
   - Relevant messages will be automatically processed
   - Data will be sent to your API endpoint
   - Check console for logs

## 📊 Data Format

The bot sends standardized JSON to your API:

```json
{
  "reportId": "WA-1701234567890-1234",
  "requestType": "shelter",
  "allRequestTypes": ["shelter", "information"],
  "urgency": "medium",
  "primaryLocation": "Colombo",
  "allLocations": ["Colombo"],
  "primaryContact": "+94775397330",
  "allContacts": ["+94775397330"],
  "originalMessage": "පළමු campus වික 1st year Management වික උදව්ගත නොමැත...",
  "language": "si",
  "source": {
    "platform": "whatsapp",
    "groupName": "Disaster Relief Group",
    "senderName": "John Doe",
    "senderNumber": "+94712345678"
  },
  "messageTimestamp": "2025-11-30T10:30:00.000Z",
  "processedTimestamp": "2025-11-30T10:30:05.000Z",
  "status": "pending",
  "verified": false
}
```

## 🗂️ Local Backups

When the API is unavailable, reports are saved to:
```
reports/reports-YYYY-MM-DD.json
```

## 🔍 Message Detection

The bot recognizes:

### Request Types
- **Food**: කෑම, ආහාර, food, meal, rice
- **Water**: වතුර, water, drinking water
- **Shelter**: නවාතැන, shelter, accommodation, boarding
- **Medical**: වෛද්‍ය, බෙහෙත්, medical, medicine, doctor
- **Rescue**: උදව්, help, emergency, rescue, missing
- **Transport**: ප්‍රවාහනය, transport, vehicle, evacuation
- **Clothing**: ඇඳුම්, clothes, clothing

### Locations
- All 25 Sri Lankan districts
## 🛠️ Troubleshooting

### Bot Issues

**Bot won't connect**
- Delete `.wwebjs_auth` folder and restart
- Make sure you're using a valid WhatsApp account
- Check your internet connection

**Messages not being detected**
- Check terminal logs - bot shows which groups it monitors
- Set `MONITORED_GROUPS=` (empty) to monitor ALL groups
- Verify messages contain keywords, phone numbers, or locations
- Check `reports/` folder for local backups

**Contact info errors**
- Bot automatically handles contact errors with fallbacks
- Reports will still be processed with available information

### Dashboard Issues

**Nothing shows on dashboard**
- Make sure server is running (`npm run server`)
- Check browser console (F12) for JavaScript errors
- Verify API endpoint returns data: http://localhost:3000/api/disaster-reports
- Check if reports exist in `api-reports/reports-2025-11-30.json`
- Restart the server to reload reports from disk

**Delete button not working**
- Check browser console for errors
- Refresh the page after deleting

**API connection failed**
- Bot will save reports locally to `reports/` folder
- Reports will sync once API is back online
### Monitor All Groups
## 📁 Project Structure

```
Bot/
├── index.js              # Main WhatsApp bot application
├── server.js             # API server + web dashboard
├── messageParser.js      # Message parsing and extraction logic
├── apiClient.js          # API communication and local backup
├── test.js               # Test suite for message parser
├── package.json          # Dependencies and scripts
├── .env                  # Configuration (create from .env.example)
├── .env.example          # Example configuration
├── reports/              # Bot local backup storage (auto-created)
├── api-reports/          # Server report storage (auto-created)
└── README.md             # This file
```

## 🔌 API Endpoints

- `POST /api/disaster-reports` - Receive new disaster reports
- `GET /api/disaster-reports` - Get all reports
- `DELETE /api/disaster-reports/:reportId` - Delete a specific report
- `GET /` - Web dashboard interface
### Bot won't connect
- Delete `.wwebjs_auth` folder and try again
- Make sure you're using a valid WhatsApp account

### Messages not being detected
- Check if the group name matches your `MONITORED_GROUPS` setting
- Verify the message contains keywords, phone numbers, or locations

### API errors
- Check your `API_ENDPOINT` configuration
- Verify your API is accessible
- Check `reports/` folder for local backups

## 📁 Project Structure
## 📊 Dashboard Features

### Statistics Cards
- **Total Reports**: All disaster requests received
- **High Urgency**: Critical requests needing immediate attention
- **Pending**: Reports awaiting action
- **Food/Shelter/Rescue Requests**: Category-specific counts

### Filtering & Search
- Filter by request type (Food, Water, Shelter, Medical, Rescue, Transport)
- Filter by urgency level (High, Medium, Low)
- Search across locations, contacts, and message content
- Results update instantly

### Report Cards
- Color-coded by urgency (Red=High, Orange=Medium, Green=Low)
- Shows all extracted information (location, contact, reporter, source)
- Displays original message in full
- One-click delete for non-important reports
- Hover effects for better UX

## 🆘 Production Deployment

For real disaster response operations:

1. **Use a Server/VPS**: Run bot and dashboard on a reliable server (not your laptop)
2. **Keep Running 24/7**: Use process managers like PM2 or systemd
3. **Monitor Logs**: Set up log aggregation and alerting
4. **Backup Data**: Regularly backup `api-reports/` folder
5. **Secure API**: Add proper authentication if exposing publicly
6. **Scale**: Consider database (MongoDB/PostgreSQL) for large volumes
7. **Multiple Bots**: Run multiple instances for redundancy

## 🔐 Security Notes

- Keep `.env` file secure (never commit to git)
- Bot session stored in `.wwebjs_auth/` - keep it secure
- API has no authentication by default - add if needed
- Dashboard is public - add login if exposing to internet

## 🚀 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication for dashboard
- [ ] WhatsApp notifications for high urgency
- [ ] Map visualization of requests
- [ ] Export reports to Excel/CSV
- [ ] Machine learning for better classification
- [ ] Multi-bot coordination
- [ ] Mobile app for field responders

---

## 🔒 Security Notes

- Keep your `.env` file secure (never commit to git)
- Use HTTPS endpoints for API
- Consider API authentication (API_KEY)
- Bot session is stored in `.wwebjs_auth/` - keep it secure

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Better NLP for message understanding
- More language support
- Database integration
- Web dashboard for viewing reports
- Machine learning for classification

## 📝 License

MIT License - Feel free to use for disaster relief efforts

## 🆘 Support

For urgent disaster response coordination needs, ensure:
1. API endpoint is properly configured
2. Bot is running 24/7 (consider using a server/VPS)
3. Monitor logs regularly
4. Have backup systems in place

---

**Made with ❤️ for Sri Lanka's Disaster Response Community** 🇱🇰
