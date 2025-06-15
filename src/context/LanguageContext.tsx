
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'english' | 'malayalam' | 'tamil';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  english: {
    welcome: 'Hello! Welcome to our delivery service! 👋',
    loginMessage: 'To place an order, please log in with your phone number. If you\'re a new customer, we\'ll create an account for you.',
    loginRegister: 'Login / Register',
    welcomeBack: 'Welcome back',
    chooseCategory: 'I\'m here to help you place an order. Let\'s start by choosing a category.',
    phoneNumber: 'Phone Number',
    enterPhone: 'Enter your phone number',
    continue: 'Continue',
    cancel: 'Cancel',
    name: 'What\'s your name?',
    address: 'Great! Now please provide your delivery address:',
    registrationSuccess: 'Perfect! Your account has been created',
    chooseShop: 'Great choice! Now please choose a shop:',
    loadingShops: 'Loading shops...',
    loadingProducts: 'Loading products...',
    noShops: 'Sorry, no shops are currently available for',
    noProducts: 'Sorry, no products are currently available from',
    addedToCart: 'Item added to cart! You can continue shopping or proceed to checkout when ready.',
    continueShopping: 'Continue Shopping',
    proceedToCheckout: 'Proceed to Checkout',
    orderSummary: 'Perfect! Here\'s your order summary:',
    category: 'Category',
    shop: 'Shop',
    items: 'Items',
    total: 'Total',
    confirmOrder: 'Would you like to confirm this order?',
    confirmOrderBtn: 'Confirm Order',
    editOrder: 'Edit Order',
    orderSuccess: '🎉 Order placed successfully!',
    orderMessage: 'Your order has been automatically sent to our admin panel and will be processed shortly. You will receive updates on your order status. Thank you for choosing our service!',
    food: 'Food',
    grocery: 'Grocery',
    vegetables: 'Vegetables',
    meat: 'Meat',
    orderAssistant: 'Order Assistant',
    selectLanguage: 'Select Language'
  },
  malayalam: {
    welcome: 'ഹലോ! ഞങ്ങളുടെ ഡെലിവറി സേവനത്തിലേക്ക് സ്വാഗതം! 👋',
    loginMessage: 'ഓർഡർ ചെയ്യാൻ, ദയവായി നിങ്ങളുടെ ഫോൺ നമ്പർ ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യുക. നിങ്ങൾ പുതിയ ഉപഭോക്താവാണെങ്കിൽ, ഞങ്ങൾ നിങ്ങൾക്ക് ഒരു അക്കൗണ്ട് സൃഷ്ടിക്കും.',
    loginRegister: 'ലോഗിൻ / രജിസ്റ്റർ',
    welcomeBack: 'തിരികെ സ്വാഗതം',
    chooseCategory: 'ഞാൻ നിങ്ങളെ ഓർഡർ ചെയ്യാൻ സഹായിക്കാൻ ഇവിടെയുണ്ട്. ഒരു വിഭാഗം തിരഞ്ഞെടുത്ത് ആരംഭിക്കാം.',
    phoneNumber: 'ഫോൺ നമ്പർ',
    enterPhone: 'നിങ്ങളുടെ ഫോൺ നമ്പർ നൽകുക',
    continue: 'തുടരുക',
    cancel: 'റദ്ദാക്കുക',
    name: 'നിങ്ങളുടെ പേര് എന്താണ്?',
    address: 'മികച്ചത്! ഇപ്പോൾ ദയവായി നിങ്ങളുടെ ഡെലിവറി വിലാസം നൽകുക:',
    registrationSuccess: 'മികച്ചത്! നിങ്ങളുടെ അക്കൗണ്ട് സൃഷ്ടിക്കപ്പെട്ടു',
    chooseShop: 'മികച്ച തിരഞ്ഞെടുപ്പ്! ഇപ്പോൾ ദയവായി ഒരു കട തിരഞ്ഞെടുക്കുക:',
    loadingShops: 'കടകൾ ലോഡ് ചെയ്യുന്നു...',
    loadingProducts: 'ഉൽപ്പന്നങ്ങൾ ലോഡ് ചെയ്യുന്നു...',
    noShops: 'ക്ഷമിക്കണം, ഇപ്പോൾ കടകൾ ലഭ്യമല്ല',
    noProducts: 'ക്ഷമിക്കണം, ഇപ്പോൾ ഉൽപ്പന്നങ്ങൾ ലഭ്യമല്ല',
    addedToCart: 'ഇനം കാർട്ടിൽ ചേർത്തു! നിങ്ങൾക്ക് ഷോപ്പിംഗ് തുടരാം അല്ലെങ്കിൽ ചെക്ക്ഔട്ടിലേക്ക് പോകാം.',
    continueShopping: 'ഷോപ്പിംഗ് തുടരുക',
    proceedToCheckout: 'ചെക്ക്ഔട്ടിലേക്ക് പോകുക',
    orderSummary: 'മികച്ചത്! ഇതാ നിങ്ങളുടെ ഓർഡർ സംഗ്രഹം:',
    category: 'വിഭാഗം',
    shop: 'കട',
    items: 'ഇനങ്ങൾ',
    total: 'ആകെ',
    confirmOrder: 'ഈ ഓർഡർ സ്ഥിരീകരിക്കാൻ നിങ്ങൾ ആഗ്രഹിക്കുന്നുണ്ടോ?',
    confirmOrderBtn: 'ഓർഡർ സ്ഥിരീകരിക്കുക',
    editOrder: 'ഓർഡർ എഡിറ്റ് ചെയ്യുക',
    orderSuccess: '🎉 ഓർഡർ വിജയകരമായി സ്ഥാപിച്ചു!',
    orderMessage: 'നിങ്ങളുടെ ഓർഡർ യാന്ത്രികമായി ഞങ്ങളുടെ അഡ്മിൻ പാനലിലേക്ക് അയച്ചു, ഉടൻ പ്രോസസ്സ് ചെയ്യും. നിങ്ങളുടെ ഓർഡർ സ്റ്റാറ്റസ് അപ്ഡേറ്റുകൾ ലഭിക്കും. ഞങ്ങളുടെ സേവനം തിരഞ്ഞെടുത്തതിന് നന്ദി!',
    food: 'ഭക്ഷണം',
    grocery: 'പലചരക്ക്',
    vegetables: 'പച്ചക്കറികൾ',
    meat: 'മാംസം',
    orderAssistant: 'ഓർഡർ അസിസ്റ്റന്റ്',
    selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക'
  },
  tamil: {
    welcome: 'வணக்கம்! எங்கள் டெலிவரி சேவைக்கு வரவேற்கிறோம்! 👋',
    loginMessage: 'ஆர்டர் செய்ய, தயவுசெய்து உங்கள் தொலைபேசி எண்ணுடன் உள்நுழையுங்கள். நீங்கள் புதிய வாடிக்கையாளராக இருந்தால், நாங்கள் உங்களுக்கு ஒரு கணக்கை உருவாக்குவோம்.',
    loginRegister: 'உள்நுழை / பதிவு',
    welcomeBack: 'மீண்டும் வரவேற்கிறோம்',
    chooseCategory: 'ஆர்டர் செய்ய உங்களுக்கு உதவ நான் இங்கே இருக்கிறேன். ஒரு பிரிவைத் தேர்ந்தெடுத்து ஆரம்பிக்கலாம்.',
    phoneNumber: 'தொலைபேசி எண்',
    enterPhone: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடுங்கள்',
    continue: 'தொடர்',
    cancel: 'ரத்து',
    name: 'உங்கள் பெயர் என்ன?',
    address: 'அருமை! இப்போது தயவுசெய்து உங்கள் டெலிவரி முகவரியை வழங்கவும்:',
    registrationSuccess: 'சரியாக! உங்கள் கணக்கு உருவாக்கப்பட்டது',
    chooseShop: 'சிறந்த தேர்வு! இப்போது தயவுசெய்து ஒரு கடையைத் தேர்ந்தெடுங்கள்:',
    loadingShops: 'கடைகள் ஏற்றப்படுகின்றன...',
    loadingProducts: 'தயாரிப்புகள் ஏற்றப்படுகின்றன...',
    noShops: 'மன்னிக்கவும், தற்போது கடைகள் கிடைக்கவில்லை',
    noProducts: 'மன்னிக்கவும், தற்போது தயாரிப்புகள் கிடைக்கவில்லை',
    addedToCart: 'பொருள் கார்ட்டில் சேர்க்கப்பட்டது! நீங்கள் ஷாப்பிங்கை தொடரலாம் அல்லது செக்அவுட்டுக்கு செல்லலாம்.',
    continueShopping: 'ஷாப்பிங்கை தொடர்',
    proceedToCheckout: 'செக்அவுட்டுக்கு செல்',
    orderSummary: 'சரியாக! இதோ உங்கள் ஆர்டர் சுருக்கம்:',
    category: 'பிரிவு',
    shop: 'கடை',
    items: 'பொருட்கள்',
    total: 'மொத்தம்',
    confirmOrder: 'இந்த ஆர்டரை உறுதிப்படுத்த விரும்புகிறீர்களா?',
    confirmOrderBtn: 'ஆர்டரை உறுதிப்படுத்து',
    editOrder: 'ஆர்டரை திருத்து',
    orderSuccess: '🎉 ஆர்டர் வெற்றிகரமாக வைக்கப்பட்டது!',
    orderMessage: 'உங்கள் ஆர்டர் தானாகவே எங்கள் நிர்வாக பேனலுக்கு அனுப்பப்பட்டது, விரைவில் செயலாக்கப்படும். உங்கள் ஆர்டர் நிலை மேம்படுத்தல்களைப் பெறுவீர்கள். எங்கள் சேவையைத் தேர்ந்தெடுத்ததற்கு நன்றி!',
    food: 'உணவு',
    grocery: 'மளிகை',
    vegetables: 'காய்கறிகள்',
    meat: 'இறைச்சி',
    orderAssistant: 'ஆர்டர் உதவியாளர்',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('english');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('customer_language') as Language;
    if (savedLanguage && ['english', 'malayalam', 'tamil'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    console.log('Setting language to:', newLanguage);
    setLanguageState(newLanguage);
    localStorage.setItem('customer_language', newLanguage);
  };

  const t = (key: string): string => {
    const translation = translations[language]?.[key] || translations.english[key] || key;
    console.log(`Translation for ${key} in ${language}:`, translation);
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
