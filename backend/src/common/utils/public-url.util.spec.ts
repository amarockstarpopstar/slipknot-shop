import { ConfigService } from '@nestjs/config';
import {
  extractPublicOrigin,
  resolvePublicBaseUrl,
  resolvePublicImageUrl,
} from './public-url.util';

describe('public-url utilities', () => {
  const createConfigService = (values: Record<string, string | undefined>) =>
    ({
      get: (key: string) => values[key],
    }) as unknown as ConfigService;

  it('prefers the first valid public base url and strips trailing slash', () => {
    const configService = createConfigService({
      APP_PUBLIC_URL: 'https://shop.example.com/',
    });

    expect(resolvePublicBaseUrl(configService)).toBe('https://shop.example.com');
  });

  it('skips invalid urls, logs the issue and falls back to the next valid value', () => {
    const warn = jest.fn();
    const configService = createConfigService({
      APP_PUBLIC_URL: 'not a valid url',
      BACKEND_PUBLIC_URL: 'http://api.example.com/base',
    });

    expect(resolvePublicBaseUrl(configService, { warn })).toBe('http://api.example.com/base');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('APP_PUBLIC_URL');
  });

  it('builds public image urls or keeps absolute urls as-is', () => {
    const baseUrl = 'https://shop.example.com';

    expect(resolvePublicImageUrl('images/photo.png', baseUrl)).toBe(
      'https://shop.example.com/images/photo.png',
    );
    expect(resolvePublicImageUrl('  ', baseUrl)).toBeNull();
    expect(resolvePublicImageUrl('https://cdn.example.com/item.png', baseUrl)).toBe(
      'https://cdn.example.com/item.png',
    );
    expect(extractPublicOrigin('https://cdn.example.com/item.png?ref=1')).toBe(
      'https://cdn.example.com',
    );
    expect(extractPublicOrigin('not-a-url')).toBe('not-a-url');
  });
});
