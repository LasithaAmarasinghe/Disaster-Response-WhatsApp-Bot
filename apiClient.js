import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class ApiClient {
    constructor() {
        this.endpoint = process.env.API_ENDPOINT;
        this.apiKey = process.env.API_KEY;
        
        if (!this.endpoint) {
            console.warn('⚠️  API_ENDPOINT not configured. Messages will be logged but not sent to API.');
        }
    }

    async sendReport(parsedData) {
        // If no endpoint configured, just log and return
        if (!this.endpoint) {
            console.log('\n📋 Standardized Report (not sent - no API configured):');
            console.log(JSON.stringify(this.formatReport(parsedData), null, 2));
            return { success: true, mock: true };
        }

        try {
            const report = this.formatReport(parsedData);
            
            const response = await axios.post(this.endpoint, report, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                timeout: 10000 // 10 second timeout
            });

            return {
                success: true,
                data: response.data,
                statusCode: response.status
            };
        } catch (error) {
            // Log the error but also save locally
            console.error('API Error:', error.message);
            
            // Save to local file as backup
            await this.saveToLocalBackup(parsedData);
            
            return {
                success: false,
                error: error.message,
                savedLocally: true
            };
        }
    }

    formatReport(parsedData) {
        return {
            // Unique ID for this report
            reportId: this.generateReportId(parsedData),
            
            // Request Information
            requestType: parsedData.requestType,
            allRequestTypes: parsedData.allRequestTypes,
            urgency: parsedData.urgency,
            
            // Location Information
            primaryLocation: parsedData.location,
            allLocations: parsedData.allLocations,
            
            // Contact Information
            primaryContact: parsedData.contactNumber,
            allContacts: parsedData.allContactNumbers,
            
            // Message Details
            originalMessage: parsedData.originalMessage,
            language: parsedData.language,
            
            // Source Information
            source: {
                platform: 'whatsapp',
                groupName: parsedData.groupName,
                senderName: parsedData.senderName,
                senderNumber: parsedData.senderNumber
            },
            
            // Timestamps
            messageTimestamp: new Date(parsedData.timestamp).toISOString(),
            processedTimestamp: new Date(parsedData.parsedAt).toISOString(),
            
            // Status
            status: 'pending',
            verified: false
        };
    }

    generateReportId(parsedData) {
        // Generate a unique ID based on timestamp and sender
        const timestamp = parsedData.timestamp || Date.now();
        const sender = parsedData.senderNumber || 'unknown';
        return `WA-${timestamp}-${sender.slice(-4)}`;
    }

    async saveToLocalBackup(parsedData) {
        try {
            const fs = await import('fs/promises');
            const path = await import('path');
            
            // Create reports directory if it doesn't exist
            const reportsDir = path.join(process.cwd(), 'reports');
            try {
                await fs.mkdir(reportsDir, { recursive: true });
            } catch (err) {
                // Directory might already exist
            }

            // Save to dated JSON file
            const date = new Date().toISOString().split('T')[0];
            const filename = path.join(reportsDir, `reports-${date}.json`);
            
            const report = this.formatReport(parsedData);
            
            // Read existing reports
            let reports = [];
            try {
                const existing = await fs.readFile(filename, 'utf8');
                reports = JSON.parse(existing);
            } catch (err) {
                // File doesn't exist yet
            }
            
            // Append new report
            reports.push(report);
            
            // Write back
            await fs.writeFile(filename, JSON.stringify(reports, null, 2));
            
            console.log(`✓ Saved to local backup: ${filename}`);
        } catch (error) {
            console.error('Failed to save local backup:', error.message);
        }
    }
}
