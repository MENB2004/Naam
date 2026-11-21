import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ml: { translation: {
    hero: {
      nav: ['ഹോം', 'NAAM എന്താണ്', 'എങ്ങനെ പ്രവർത്തിക്കുന്നു', 'പരിസ്ഥിതി പ്രശ്നങ്ങൾ', 'ബന്ധപ്പെടുക'],
      badge: 'കേരളത്തിന്റെ പരിസ്ഥിതി സംരക്ഷണത്തിനായി ഒരുമിച്ച്',
      headingA: 'നമ്മുടെ നാടിന്റെ പരിസ്ഥിതി സംരക്ഷണം,', headingB: 'ഇനി നമ്മുടെ കൈകളിൽ.',
      body: 'മാലിന്യ പ്രശ്നങ്ങൾ, ജലമലിനീകരണം, ഡ്രെയിനേജ് തടസ്സങ്ങൾ തുടങ്ങിയ പരിസ്ഥിതി പ്രശ്നങ്ങൾ റിപ്പോർട്ട് ചെയ്യാനും ബന്ധപ്പെട്ട അധികാരികളുമായി ബന്ധപ്പെടാനും അവയുടെ പരിഹാര പുരോഗതി നിരീക്ഷിക്കാനും NAAM നിങ്ങളെ സഹായിക്കുന്നു.',
      report: 'പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക', how: 'എങ്ങനെ പ്രവർത്തിക്കുന്നു?', liveMap: 'ലൈവ് മാപ്പ്', logout: 'ലോഗ് ഔട്ട്',
    },
    landing: {
      aboutTitle: 'പരാതിയിൽ നിന്ന് പരിഹാരത്തിലേക്ക്, ഒരുമിച്ച്.', aboutBody: 'കേരളത്തിലെ സമൂഹങ്ങളെയും പ്രാദേശിക സ്ഥാപനങ്ങളെയും ബന്ധിപ്പിക്കുന്ന പരിസ്ഥിതി നിരീക്ഷണ വേദിയാണ് NAAM.',
      workflowLabel: 'പ്രവർത്തനരീതി', workflowTitle: 'പരാതി മുതൽ പരിഹാര പരിശോധന വരെ', workflowIntro: 'ഓരോ ഘട്ടത്തിലും എന്താണ് സംഭവിക്കുന്നതെന്ന് എളുപ്പത്തിൽ മനസ്സിലാക്കാം.',
      steps: [
        { title: 'പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക', body: 'സ്ഥലവും ആവശ്യമായ വിവരങ്ങളും ചേർത്ത് പരാതി സമർപ്പിക്കുക.' },
        { title: 'അധികാരികൾ പരിശോധിക്കുന്നു', body: 'പരാതി ശരിയായ വകുപ്പിലേക്ക് കൈമാറുന്നു.' },
        { title: 'സ്ഥലപരിശോധന നടത്തുന്നു', body: 'ഫീൽഡ് ഉദ്യോഗസ്ഥർ പരിശോധിച്ച് നടപടികൾ രേഖപ്പെടുത്തുന്നു.' },
        { title: 'പരിഹാരം ഉറപ്പാക്കുന്നു', body: 'പുരോഗതി പിന്തുടർന്ന് പരിഹാരം സ്ഥിരീകരിക്കാം.' },
      ],
      portalLabel: 'പോർട്ടലുകൾ', portalTitle: 'നിങ്ങൾക്കാവശ്യമായ NAAM സേവനം തിരഞ്ഞെടുക്കുക', portalIntro: 'ഓരോ പോർട്ടലും അതത് ചുമതലയ്ക്കനുസരിച്ചുള്ള ഉപകരണങ്ങളിലേക്ക് നയിക്കുന്നു.',
      portals: [
        { title: 'പൗരൻ', subtitle: 'Community Portal', description: 'പരിസ്ഥിതി പ്രശ്നങ്ങൾ റിപ്പോർട്ട് ചെയ്യുകയും പുരോഗതി പിന്തുടരുകയും ചെയ്യുക.', action: 'പ്രവേശിക്കുക' },
        { title: 'അധികാരി', subtitle: 'Authority Portal', description: 'പരാതികൾ വിലയിരുത്തി ബന്ധപ്പെട്ട ഉദ്യോഗസ്ഥർക്ക് കൈമാറുക.', action: 'പ്രവേശിക്കുക' },
        { title: 'ഫീൽഡ് ഓഫീസർ', subtitle: 'Field Officer Portal', description: 'സ്ഥലപരിശോധനയും പരിഹാര നടപടികളും രേഖപ്പെടുത്തുക.', action: 'പ്രവേശിക്കുക' },
        { title: 'സിസ്റ്റം അഡ്മിൻ', subtitle: 'Super Admin Portal', description: 'പ്ലാറ്റ്‌ഫോം ക്രമീകരണങ്ങളും ഭരണപരമായ ഉപകരണങ്ങളും കൈകാര്യം ചെയ്യുക.', action: 'പ്രവേശിക്കുക' },
      ],
      issueLabel: 'പരിസ്ഥിതി പ്രശ്നങ്ങൾ', issueTitle: 'നിങ്ങളുടെ പ്രദേശത്തെ പ്രശ്നങ്ങൾ അറിയിക്കുക', issueIntro: 'വിഷയം തിരഞ്ഞെടുക്കുമ്പോൾ പരാതി സമർപ്പിക്കുന്നതിനുള്ള ഫോം തുറക്കും.', report: 'റിപ്പോർട്ട് ചെയ്യുക',
      categories: [
        { title: 'മാലിന്യ നിയന്ത്രണം', description: 'കൂമ്പാരങ്ങൾ, ശേഖരണം, സംസ്കരണം' },
        { title: 'ജലമലിനീകരണം', description: 'കുളങ്ങൾ, നദികൾ, കുടിവെള്ളം' },
        { title: 'ഓടയും മലിനജലവും', description: 'തടസ്സങ്ങളും ചോർച്ചകളും' },
        { title: 'വെള്ളപ്പൊക്കം', description: 'വെള്ളക്കെട്ടും പ്രളയസാധ്യതയും' },
        { title: 'മറ്റ് പരിസ്ഥിതി പ്രശ്നങ്ങൾ', description: 'മറ്റു പ്രാദേശിക ആശങ്കകൾ' },
      ],
    },
  } },
  en: { translation: {
    hero: {
      nav: ['Home', 'About NAAM', 'How It Works', 'Environmental Issues', 'Contact'],
      badge: 'Together for a cleaner, healthier Kerala', headingA: 'Protecting the places', headingB: 'we call home.',
      body: 'NAAM helps communities report waste, water pollution, blocked drains and other environmental concerns, connect with the right authorities, and follow each issue through to resolution.',
      report: 'Report an Issue', how: 'How It Works', liveMap: 'Live Map', logout: 'Log out',
    },
    landing: {
      aboutTitle: 'From a report to a resolution, together.', aboutBody: 'NAAM connects Kerala communities and local institutions through a shared environmental monitoring platform.',
      workflowLabel: 'HOW IT WORKS', workflowTitle: 'From reporting to resolution checks', workflowIntro: 'See what happens at every step of the process.',
      steps: [
        { title: 'Report an issue', body: 'Submit a concern with its location and the details needed to act.' },
        { title: 'Authority review', body: 'The report is routed to the appropriate department.' },
        { title: 'Field inspection', body: 'Field staff inspect the site and record their actions.' },
        { title: 'Resolution and verification', body: 'Follow progress and confirm when the issue is resolved.' },
      ],
      portalLabel: 'PORTALS', portalTitle: 'Choose the NAAM service you need', portalIntro: 'Each portal provides tools for its specific responsibilities.',
      portals: [
        { title: 'Citizen', subtitle: 'Community Portal', description: 'Report environmental issues and follow their progress.', action: 'Sign in' },
        { title: 'Authority', subtitle: 'Authority Portal', description: 'Review reports and route them to the right teams.', action: 'Sign in' },
        { title: 'Field Officer', subtitle: 'Field Officer Portal', description: 'Record site inspections and resolution work.', action: 'Sign in' },
        { title: 'System Admin', subtitle: 'Super Admin Portal', description: 'Manage platform settings and administrative tools.', action: 'Sign in' },
      ],
      issueLabel: 'ENVIRONMENTAL ISSUES', issueTitle: 'Report an issue in your area', issueIntro: 'Choose a category to open the report form.', report: 'Report an issue',
      categories: [
        { title: 'Waste management', description: 'Dumping, collection and disposal' },
        { title: 'Water pollution', description: 'Ponds, rivers and drinking water' },
        { title: 'Drainage and sewage', description: 'Blockages and leaks' },
        { title: 'Flooding', description: 'Waterlogging and flood risks' },
        { title: 'Other environmental issues', description: 'Other local concerns' },
      ],
    },
  } },
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
