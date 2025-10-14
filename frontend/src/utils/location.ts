export const SUPPORTED_COUNTRIES = ['Россия', 'Беларусь', 'Казахстан', 'Армения', 'Грузия', 'Другая страна'] as const;

export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

export const getCitiesByCountry = (country: string): string[] => {
  switch (country) {
    case 'Россия':
      return ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань'];
    case 'Беларусь':
      return ['Минск', 'Гродно', 'Брест'];
    case 'Казахстан':
      return ['Алматы', 'Астана', 'Шымкент'];
    default:
      return [];
  }
};

export const normalizeCountry = (country: string | null | undefined) => country?.trim().toLowerCase() ?? '';

export const isRussianCountry = (country: string | null | undefined) => normalizeCountry(country) === 'россия';
