import React from 'react';
import { useTranslation } from 'react-i18next';

interface SkipToContentProps {
  targetId?: string;
}

export const SkipToContent: React.FC<SkipToContentProps> = ({
  targetId = 'main-content',
}) => {
  const { i18n } = useTranslation();
  const isMl = i18n.language === 'ml';

  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-emerald-800 focus:text-white focus:rounded-lg focus:shadow-2xl focus:font-bold focus:text-sm focus:outline-none focus:ring-4 focus:ring-emerald-400"
    >
      {isMl ? 'പ്രധാന ഉള്ളടക്കത്തിലേക്ക് പോകുക' : 'Skip to main content'}
    </a>
  );
};
