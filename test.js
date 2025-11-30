import { MessageParser } from './messageParser.js';

// Test messages from the images
const testMessages = [
    {
        text: `කැලණිය චිත්‍ර විදුහාලයේ විදුහා පියවරේ කියිවා විදුහා පාඩමලාව පළමු වැස්ස ඉඟෙනුම් ලැබන බී. ඒ. සයුරී රන්දිතා හන්සමාලි 2025/11/27 (බනස්පතින්දා) දින උදෑසන ගමපොල පුළියේ සිය නිවස වෙත යාමට විදුහාල දලුම පැරුගෙන පිටත් ආ ඈ මෙන ඊම අගෙන කිසිදු කොරතුරුත් නොමැත.

මේ පිළිබඳ කොරතුරුත් ඇදෙනොත් පහත දර්ශතය අංකය ඔස්වේදේ ඇමත සම්බන්ධය කර ගන්නා.
දිනාංශ - 0702077913`,
        description: 'Missing person report with contact number'
    },
    {
        text: `admin අයියේ මේක අහිවා යෙයා කාරලා ලොන්නා ගෙන්නන ගමපෙග station එක හරියේ තටිහු ලෙලේ ගෙදරහ අපේ තාත්තයි එ ගෙදෙර මිනිස්සුයි තියේ වෙලා ඉන්නේ ලගට විදුරිනන හව ඇඩ අමී 4 ක් වගේ තියෙන්හ අපෙත් එයිස්මි බොට්දු වෙටා කනහ කරහරි එහමත් කිවිව ට නෑම අස්හන් හා ළඟියේ ඔක්කොම කටිරිය 5 දෙනෙකේ ඉන්හවි අපෙ .. 💔🙏🙏 වනුර වැඩි වැඩි වෙනුවිල එන්න එහන්නම ආපෙටෙ හම්බර ස බීසිලු ගමපෙග ටයියේම ස්වෙයකහ එක හරියේ තඩිටු ලෙලේ ගෙදරහ තාත්තා හා mobile number eka 0769478301 ඒයිස් දෙවී කරන්න අපෙ තාරු හරි කියිලු ඒ හුඑහත`,
        description: 'Urgent rescue request with location and contact'
    },
    {
        text: `පළමු campus වික
1st year Management වික උවමගෙ නුඹ

කැලණිමුල ආරම් කෙම්හ එක ලග මේ බෙද්ද මිතියෙ 14 දෙනෙකට ඈර අඩුවල නුකබව, වැඩවර කෑම සකහොරයේ වූගකුෙ යලිගුම් නෑ, දැහැට තියකන කෑම බිසිහ සිමිරින්ය. යුයව විහන සිසිම විලොට නෑ කේදටගරහ කෙළු අමුලු.

Address -79/A, කැලණිමුලම අනගොහ
Contact Number - 0775397330`,
        description: 'Shelter/accommodation request with address and contact'
    },
    {
        text: `Need urgent medical supplies in Gampaha area. Contact 0712345678`,
        description: 'English medical request'
    },
    {
        text: `Food and water needed in Ratnapura district. 50 families affected. Call 0777654321`,
        description: 'English food and water request'
    }
];

async function runTests() {
    console.log('🧪 Testing Message Parser\n');
    console.log('='.repeat(80));
    
    const parser = new MessageParser();
    
    for (let i = 0; i < testMessages.length; i++) {
        const test = testMessages[i];
        console.log(`\n📝 Test ${i + 1}: ${test.description}`);
        console.log('-'.repeat(80));
        console.log('Original Message:');
        console.log(test.text.substring(0, 150) + '...\n');
        
        const result = await parser.parseMessage(test.text, {
            groupName: 'Test Disaster Relief Group',
            senderName: 'Test User',
            senderNumber: '+94711111111',
            timestamp: Date.now()
        });
        
        if (result.isRelevant) {
            console.log('✓ Relevant message detected');
            console.log(`  Request Type: ${result.requestType}`);
            console.log(`  All Types: ${result.allRequestTypes.join(', ')}`);
            console.log(`  Urgency: ${result.urgency}`);
            console.log(`  Language: ${result.language}`);
            console.log(`  Location: ${result.location || 'Not detected'}`);
            console.log(`  All Locations: ${result.allLocations.join(', ') || 'None'}`);
            console.log(`  Primary Contact: ${result.contactNumber || 'Not detected'}`);
            console.log(`  All Contacts: ${result.allContactNumbers.join(', ') || 'None'}`);
        } else {
            console.log('✗ Not recognized as relevant');
        }
        
        console.log('='.repeat(80));
    }
    
    console.log('\n✅ Tests completed!\n');
}

// Run tests
runTests().catch(console.error);
