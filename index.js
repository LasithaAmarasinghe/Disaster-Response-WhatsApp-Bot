import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import { MessageParser } from './messageParser.js';
import { ApiClient } from './apiClient.js';

dotenv.config();

class DisasterResponseBot {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
        
        this.parser = new MessageParser();
        this.apiClient = new ApiClient();
        this.monitoredGroups = process.env.MONITORED_GROUPS 
            ? process.env.MONITORED_GROUPS.split(',').map(g => g.trim())
            : [];
        this.autoReply = process.env.AUTO_REPLY === 'true';
        
        this.initializeHandlers();
    }

    initializeHandlers() {
        // QR Code Generation
        this.client.on('qr', (qr) => {
            console.log('Scan this QR code with your WhatsApp:');
            qrcode.generate(qr, { small: true });
        });

        // Ready Event
        this.client.on('ready', () => {
            console.log('✓ WhatsApp bot is ready!');
            console.log(`Monitoring ${this.monitoredGroups.length} groups`);
        });

        // Message Handler
        this.client.on('message', async (message) => {
            await this.handleMessage(message);
        });

        // Store bot's own number when ready
        this.client.on('ready', async () => {
            const info = this.client.info;
            this.botNumber = info.wid.user;
            console.log(`Bot number: ${this.botNumber}`);
        });

        // Error Handler
        this.client.on('auth_failure', () => {
            console.error('Authentication failed. Please delete .wwebjs_auth folder and try again.');
        });

        this.client.on('disconnected', (reason) => {
            console.log('Client was disconnected:', reason);
        });
    }

    async handleMessage(message) {
        try {
            // Get chat info
            const chat = await message.getChat();
            
            // Debug logging
            console.log(`\n📩 Message received from: ${chat.isGroup ? 'Group: ' + chat.name : 'Private chat'}`);
            
            // Only process group messages
            if (!chat.isGroup) {
                console.log('  ⏭️  Skipped: Not a group message');
                return;
            }
            
            // Check if this group should be monitored
            const shouldMonitor = this.monitoredGroups.length === 0 || 
                                this.monitoredGroups.some(groupName => 
                                    chat.name.toLowerCase().includes(groupName.toLowerCase())
                                );
            
            console.log(`  Monitoring: ${this.monitoredGroups.join(', ') || 'ALL groups'}`);
            console.log(`  Should monitor: ${shouldMonitor}`);
            
            if (!shouldMonitor) {
                console.log('  ⏭️  Skipped: Group not in monitored list');
                return;
            }

            // Get contact info (with fallback)
            let contact;
            let senderName = 'Unknown';
            let senderNumber = message.from || 'Unknown';
            
            try {
                contact = await message.getContact();
                senderName = contact.pushname || contact.name || contact.number || 'Unknown';
                senderNumber = contact.number || message.from || 'Unknown';
            } catch (err) {
                console.log('  ⚠️  Could not get contact info, using fallback');
                // Extract from message.from (format: number@c.us)
                senderNumber = message.from.split('@')[0];
            }
            
            console.log(`  Message text: "${message.body.substring(0, 100)}..."`);
            
            // Parse the message
            const parsedData = await this.parser.parseMessage(message.body, {
                groupName: chat.name,
                senderName: senderName,
                senderNumber: senderNumber,
                timestamp: message.timestamp
            });

            // If relevant information was extracted, send to API
            if (parsedData.isRelevant) {
                console.log('  ✅ Relevant message detected:');
                console.log(`Group: ${chat.name}`);
                console.log(`From: ${senderName}`);
                console.log(`Type: ${parsedData.requestType}`);
                console.log(`Location: ${parsedData.location || 'Not specified'}`);
                console.log(`Contact: ${parsedData.contactNumber || 'Not specified'}`);
                
                // Send to API
                const apiResult = await this.apiClient.sendReport(parsedData);
                
                if (apiResult.success) {
                    console.log('✓ Successfully sent to API');
                    
                    // Optional auto-reply
                    if (this.autoReply) {
                        const replyMsg = process.env.REPLY_MESSAGE || 
                                       'Thank you. Your message has been recorded.';
                        await message.reply(replyMsg);
                    }
                } else {
                    console.error('✗ Failed to send to API:', apiResult.error);
                }
            } else {
                console.log('  ⏭️  Skipped: Message not relevant (no disaster keywords/contacts detected)');
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    async start() {
        console.log('Starting WhatsApp Disaster Response Bot...');
        await this.client.initialize();
    }
}

// Start the bot
const bot = new DisasterResponseBot();
bot.start().catch(console.error);
