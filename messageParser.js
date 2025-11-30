export class MessageParser {
    constructor() {
        // Keywords for different types of requests (English and Sinhala)
        this.keywords = {
            food: {
                en: ['food', 'meal', 'hungry', 'eat', 'rice', 'supplies', 'rations'],
                si: ['කෑම', 'ආහාර', 'බත්', 'කන්න', 'ආපන']
            },
            water: {
                en: ['water', 'drinking water', 'clean water', 'bottles'],
                si: ['වතුර', 'ජලය', 'බොන්න', 'පිරිසිදු වතුර']
            },
            shelter: {
                en: ['shelter', 'accommodation', 'place to stay', 'housing', 'room', 'boarding'],
                si: ['නවාතැන', 'නිවාස', 'කාමර', 'තැන', 'පදිංචිය']
            },
            medical: {
                en: ['medical', 'medicine', 'doctor', 'hospital', 'health', 'sick', 'injured'],
                si: ['වෛද්‍ය', 'බෙහෙත්', 'රෝහල', 'සෞඛ්‍ය', 'අසනීප']
            },
            rescue: {
                en: ['rescue', 'help', 'emergency', 'stuck', 'trapped', 'stranded', 'missing'],
                si: ['ගලවා', 'උදව්', 'හදිසි', 'අතරමං', 'අතුරුදහන්', 'සිරවී']
            },
            transport: {
                en: ['transport', 'vehicle', 'ride', 'evacuation', 'travel'],
                si: ['ප්‍රවාහනය', 'වාහන', 'ගමන්', 'ඉවත්වීම']
            },
            clothing: {
                en: ['clothes', 'clothing', 'dress', 'wear'],
                si: ['ඇඳුම්', 'ඇඳුම', 'ඇඳිය']
            },
            information: {
                en: ['information', 'contact', 'number', 'phone', 'call', 'reach'],
                si: ['තොරතුරු', 'දුරකථන', 'ඇමතුම', 'අංකය', 'සම්බන්ධ']
            }
        };

        // Urgency indicators
        this.urgencyKeywords = {
            high: ['urgent', 'emergency', 'immediate', 'asap', 'critical', 'හදිසි', 'වහාම'],
            medium: ['soon', 'needed', 'required', 'අවශ්‍ය'],
            low: []
        };

        // Common Sri Lankan location patterns
        this.locationPatterns = [
            // District names
            /\b(Colombo|Gampaha|Kalutara|Kandy|Matale|Nuwara Eliya|Galle|Matara|Hambantota|Jaffna|Kilinochchi|Mannar|Vavuniya|Mullaitivu|Batticaloa|Ampara|Trincomalee|Kurunegala|Puttalam|Anuradhapura|Polonnaruwa|Badulla|Monaragala|Ratnapura|Kegalle)\b/gi,
            // Common city/town names
            /\b(Dehiwala|Mount Lavinia|Moratuwa|Negombo|Kandy|Maharagama|Kelaniya|Panadura|Kottawa|Homagama|Kaduwela|Wattala|Ja-Ela|Ragama)\b/gi,
            // Sinhala location indicators
            /(?:මාර්ග|පාර|තැන|ගම|නගර|දිස්ත්‍රික්|ප්‍රදේශ|ස්ථානය)\s*[:\-]?\s*([^\n]+)/gi
        ];

        // Phone number patterns (Sri Lankan)
        this.phonePattern = /(?:\+94|0)?(?:7\d{8}|[1-9]\d{8})/g;
    }

    detectRequestType(text) {
        const lowerText = text.toLowerCase();
        const detectedTypes = [];

        for (const [type, keywords] of Object.entries(this.keywords)) {
            const allKeywords = [...keywords.en, ...keywords.si];
            if (allKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
                detectedTypes.push(type);
            }
        }

        return detectedTypes.length > 0 ? detectedTypes : ['general'];
    }

    detectUrgency(text) {
        const lowerText = text.toLowerCase();

        for (const [level, keywords] of Object.entries(this.urgencyKeywords)) {
            if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
                return level;
            }
        }

        return 'medium'; // Default urgency
    }

    extractLocations(text) {
        const locations = new Set();

        this.locationPatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                const location = match[1] || match[0];
                if (location && location.trim().length > 2) {
                    locations.add(location.trim());
                }
            }
        });

        return Array.from(locations);
    }

    extractPhoneNumbers(text) {
        const numbers = text.match(this.phonePattern);
        if (!numbers) return [];

        // Normalize phone numbers
        return numbers.map(num => {
            num = num.replace(/\s+/g, '');
            if (num.startsWith('0')) {
                return '+94' + num.substring(1);
            } else if (!num.startsWith('+')) {
                return '+94' + num;
            }
            return num;
        });
    }

    isRelevantMessage(text) {
        // Check if message is likely a disaster-related request
        const requestTypes = this.detectRequestType(text);
        const hasPhoneNumber = this.phonePattern.test(text);
        const hasLocation = this.extractLocations(text).length > 0;

        // Message is relevant if it mentions needs OR has contact info
        return requestTypes.length > 0 || hasPhoneNumber || hasLocation;
    }

    async parseMessage(messageText, metadata = {}) {
        const isRelevant = this.isRelevantMessage(messageText);
        
        if (!isRelevant) {
            return { isRelevant: false };
        }

        const requestTypes = this.detectRequestType(messageText);
        const urgency = this.detectUrgency(messageText);
        const locations = this.extractLocations(messageText);
        const phoneNumbers = this.extractPhoneNumbers(messageText);

        return {
            isRelevant: true,
            requestType: requestTypes[0], // Primary type
            allRequestTypes: requestTypes,
            urgency: urgency,
            location: locations.length > 0 ? locations[0] : null,
            allLocations: locations,
            contactNumber: phoneNumbers.length > 0 ? phoneNumbers[0] : null,
            allContactNumbers: phoneNumbers,
            originalMessage: messageText,
            groupName: metadata.groupName,
            senderName: metadata.senderName,
            senderNumber: metadata.senderNumber,
            timestamp: metadata.timestamp ? metadata.timestamp * 1000 : Date.now(),
            parsedAt: Date.now(),
            language: this.detectLanguage(messageText)
        };
    }

    detectLanguage(text) {
        // Simple language detection based on Unicode ranges
        const sinhalaPattern = /[\u0D80-\u0DFF]/;
        const tamilPattern = /[\u0B80-\u0BFF]/;
        
        if (sinhalaPattern.test(text)) return 'si';
        if (tamilPattern.test(text)) return 'ta';
        return 'en';
    }
}
