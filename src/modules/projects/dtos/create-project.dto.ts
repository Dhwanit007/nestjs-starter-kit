import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty({message:'Please Select Atleat One Employee in the below field'})
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  assignedEmployeeIds: string[];
}
