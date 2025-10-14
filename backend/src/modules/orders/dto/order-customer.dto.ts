import { ApiProperty } from '@nestjs/swagger';

// dto representing a lightweight customer entry for managers
export class OrderCustomerDto {
  @ApiProperty({ example: 7, description: 'Идентификатор пользователя' })
  id: number;

  @ApiProperty({ example: 'Сид Уилсон', description: 'Имя покупателя' })
  name: string;

  @ApiProperty({ example: 'sid@slipknot.com', description: 'Электронная почта покупателя' })
  email: string;
}
