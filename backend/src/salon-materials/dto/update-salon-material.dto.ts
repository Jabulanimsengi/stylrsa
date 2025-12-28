import { PartialType } from '@nestjs/mapped-types';
import { CreateSalonMaterialDto } from './create-salon-material.dto';

export class UpdateSalonMaterialDto extends PartialType(CreateSalonMaterialDto) { }
