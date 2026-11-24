import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonMl from './locales/ml/common.json';
import authMl from './locales/ml/auth.json';
import communityMl from './locales/ml/community.json';
import complaintsMl from './locales/ml/complaints.json';
import authorityMl from './locales/ml/authority.json';
import adminMl from './locales/ml/admin.json';
import analyticsMl from './locales/ml/analytics.json';

import commonEn from './locales/en/common.json';
import authEn from './locales/en/auth.json';
import communityEn from './locales/en/community.json';
import complaintsEn from './locales/en/complaints.json';
import authorityEn from './locales/en/authority.json';
import adminEn from './locales/en/admin.json';
import analyticsEn from './locales/en/analytics.json';

const resources = {
  ml: {
    translation: {
      common: commonMl,
      auth: authMl,
      community: communityMl,
      complaints: complaintsMl,
      authority: authorityMl,
      admin: adminMl,
      analytics: analyticsMl,
      hero: {
        nav: ['ഹോം', 'NAAM എന്താണ്', 'എങ്ങനെ പ്രവർത്തിക്കുന്നു', 'പരിസ്ഥിതി പ്രശ്നങ്ങൾ', 'പൊതു മാപ്പ്', 'ബന്ധപ്പെടുക'],
        badge: 'കേരളത്തിന്റെ പരിസ്ഥിതി സംരക്ഷണത്തിനായി ഒരുമിച്ച്',
        headingA: 'നമ്മുടെ നാടിന്റെ പരിസ്ഥിതി സംരക്ഷണം,',
        headingB: 'ഇനി നമ്മുടെ കൈകളിൽ.',
        body: 'മാലിന്യ പ്രശ്നങ്ങൾ, ജലമലിനീകരണം, ഡ്രെയിനേജ് തടസ്സങ്ങൾ തുടങ്ങിയ പരിസ്ഥിതി പ്രശ്നങ്ങൾ റിപ്പോർട്ട് ചെയ്യാനും ബന്ധപ്പെട്ട അധികാരികളുമായി ബന്ധപ്പെടാനും അവയുടെ പരിഹാര പുരോഗതി നിരീക്ഷിക്കാനും NAAM നിങ്ങളെ സഹായിക്കുന്നു.',
        report: 'പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക',
        how: 'എങ്ങനെ പ്രവർത്തിക്കുന്നു?',
        liveMap: 'ലൈവ് മാപ്പ്',
        logout: 'ലോഗ് ഔട്ട്',
        signIn: 'പ്രവേശിക്കുക',
        dashboard: 'എന്റെ ഡാഷ്ബോർഡ്',
        officialAccess: 'ഔദ്യോഗിക പ്രവേശനം',
      },
      landing: {
        aboutTitle: 'പരാതിയിൽ നിന്ന് പരിഹാരത്തിലേക്ക്, ഒരുമിച്ച്.',
        aboutBody: 'കേരളത്തിലെ സമൂഹങ്ങളെയും പ്രാദേശിക സ്ഥാപനങ്ങളെയും ബന്ധിപ്പിക്കുന്ന പരിസ്ഥിതി നിരീക്ഷണ വേദിയാണ് NAAM.',
        workflowLabel: 'പ്രവർത്തനരീതി',
        workflowTitle: 'പരാതി മുതൽ പരിഹാര പരിശോധന വരെ',
        workflowIntro: 'ഓരോ ഘട്ടത്തിലും എന്താണ് സംഭവിക്കുന്നതെന്ന് എളുപ്പത്തിൽ മനസ്സിലാക്കാം.',
        steps: [
          { title: 'പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക', body: 'സ്ഥലവും ആവശ്യമായ വിവരങ്ങളും ചേർത്ത് പരാതി സമർപ്പിക്കുക.' },
          { title: 'അധികാരികൾ പരിശോധിക്കുന്നു', body: 'പരാതി ശരിയായ വകുപ്പിലേക്ക് കൈമാറുന്നു.' },
          { title: 'സ്ഥലപരിശോധന നടത്തുന്നു', body: 'ഫീൽഡ് ഉദ്യോഗസ്ഥർ പരിശോധിച്ച് നടപടികൾ രേഖപ്പെടുത്തുന്നു.' },
          { title: 'പരിഹാരം ഉറപ്പാക്കുന്നു', body: 'പുരോഗതി പിന്തുടർന്ന് പരിഹാരം സ്ഥിരീകരിക്കാം.' },
        ],
        joinTitle: 'നിങ്ങളുടെ പ്രദേശത്തെ പരിസ്ഥിതി സംരക്ഷണത്തിൽ നിങ്ങളും പങ്കാളിയാകൂ.',
        joinBody: 'അംഗമായി ചേർന്ന് പ്രശ്നങ്ങൾ റിപ്പോർട്ട് ചെയ്യൂ, നടപടികളുടെ പുരോഗതി പിന്തുടരൂ.',
        register: 'കമ്മ്യൂണിറ്റി അംഗമായി ചേരുക',
        issueLabel: 'പരിസ്ഥിതി പ്രശ്നങ്ങൾ',
        issueTitle: 'നിങ്ങളുടെ പ്രദേശത്തെ പ്രശ്നങ്ങൾ അറിയിക്കുക',
        issueIntro: 'വിഷയം തിരഞ്ഞെടുക്കുമ്പോൾ പരാതി സമർപ്പിക്കുന്നതിനുള്ള ഫോം തുറക്കും.',
        report: 'റിപ്പോർട്ട് ചെയ്യുക',
        categories: [
          { title: 'മാലിന്യ നിയന്ത്രണം', description: 'കൂമ്പാരങ്ങൾ, ശേഖരണം, സംസ്കരണം' },
          { title: 'ജലമലിനീകരണം', description: 'കുളങ്ങൾ, നദികൾ, കുടിവെള്ളം' },
          { title: 'ഓടയും മലിനജലവും', description: 'തടസ്സങ്ങളും ചോർച്ചകളും' },
          { title: 'വെള്ളപ്പൊക്കം', description: 'വെള്ളക്കെട്ടും പ്രളയസാധ്യതയും' },
          { title: 'മറ്റ് പരിസ്ഥിതി പ്രശ്നങ്ങൾ', description: 'മറ്റു പ്രാദേശിക ആശങ്കകൾ' },
        ],
      },
    },
  },
  en: {
    translation: {
      common: commonEn,
      auth: authEn,
      community: communityEn,
      complaints: complaintsEn,
      authority: authorityEn,
      admin: adminEn,
      analytics: analyticsEn,
      hero: {
        nav: ['Home', 'About NAAM', 'How It Works', 'Environmental Issues', 'Public Map', 'Contact'],
        badge: 'Together for a cleaner, healthier Kerala',
        headingA: 'Protecting the places',
        headingB: 'we call home.',
        body: 'NAAM helps communities report waste, water pollution, blocked drains and other environmental concerns, connect with the right authorities, and follow each issue through to resolution.',
        report: 'Report an Issue',
        how: 'How It Works',
        liveMap: 'Live Map',
        logout: 'Log out',
        signIn: 'Sign in',
        dashboard: 'My dashboard',
        officialAccess: 'Official Access',
      },
      landing: {
        aboutTitle: 'From a report to a resolution, together.',
        aboutBody: 'NAAM connects Kerala communities and local institutions through a shared environmental monitoring platform.',
        workflowLabel: 'HOW IT WORKS',
        workflowTitle: 'From reporting to resolution checks',
        workflowIntro: 'See what happens at every step of the process.',
        steps: [
          { title: 'Report an issue', body: 'Submit a concern with its location and the details needed to act.' },
          { title: 'Authority review', body: 'The report is routed to the appropriate department.' },
          { title: 'Field inspection', body: 'Field staff inspect the site and record their actions.' },
          { title: 'Resolution and verification', body: 'Follow progress and confirm when the issue is resolved.' },
        ],
        joinTitle: 'Take part in protecting the environment in your community.',
        joinBody: 'Join as a community member, report issues, and follow their progress.',
        register: 'Register as a community member',
        issueLabel: 'ENVIRONMENTAL ISSUES',
        issueTitle: 'Report an issue in your area',
        issueIntro: 'Choose a category to open the report form.',
        report: 'Report an issue',
        categories: [
          { title: 'Waste management', description: 'Dumping, collection and disposal' },
          { title: 'Water pollution', description: 'Ponds, rivers and drinking water' },
          { title: 'Drainage and sewage', description: 'Blockages and leaks' },
          { title: 'Flooding', description: 'Waterlogging and flood risks' },
          { title: 'Other environmental issues', description: 'Other local concerns' },
        ],
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('naam_language') === 'en' ? 'en' : 'ml',
  fallbackLng: 'ml',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (language) => {
  const lang = language.startsWith('en') ? 'en' : 'ml';
  document.documentElement.lang = lang;
  localStorage.setItem('naam_language', lang);
});

export default i18n;
