import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserSetting } from './entities/user-setting.entity';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UserSettingsResponseDto } from './dto/user-settings-response.dto';

const DEFAULT_SETTINGS: UserSettingsResponseDto = {
  theme: 'dark',
  dateFormat: 'DD.MM.YYYY',
  numberFormat: '1 234,56',
  itemsPerPage: 20,
  savedFilters: {},
};

// service handling persistence of user settings on the server
@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSetting)
    private readonly settingsRepository: Repository<UserSetting>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findForUser(userId: number): Promise<UserSettingsResponseDto> {
    const entity = await this.getOrCreateEntity(userId);
    return this.toDto(entity);
  }

  async updateForUser(
    userId: number,
    payload: UpdateUserSettingsDto,
  ): Promise<UserSettingsResponseDto> {
    const entity = await this.getOrCreateEntity(userId);

    if (payload.theme) {
      entity.theme = payload.theme;
    }

    if (payload.dateFormat) {
      entity.dateFormat = payload.dateFormat;
    }

    if (payload.numberFormat) {
      entity.numberFormat = payload.numberFormat;
    }

    if (payload.itemsPerPage !== undefined) {
      entity.itemsPerPage = payload.itemsPerPage;
    }

    if (payload.savedFilters) {
      entity.savedFilters = payload.savedFilters;
    }

    const saved = await this.settingsRepository.save(entity);
    return this.toDto(saved);
  }

  private async getOrCreateEntity(userId: number): Promise<UserSetting> {
    const existing = await this.settingsRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    if (existing) {
      return existing;
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const created = this.settingsRepository.create({
      user,
      ...DEFAULT_SETTINGS,
    });

    return this.settingsRepository.save(created);
  }

  private toDto(entity: UserSetting): UserSettingsResponseDto {
    return {
      theme: entity.theme,
      dateFormat: entity.dateFormat,
      numberFormat: entity.numberFormat,
      itemsPerPage: entity.itemsPerPage,
      savedFilters: entity.savedFilters ?? {},
    };
  }
}
