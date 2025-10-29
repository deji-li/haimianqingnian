import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { Campus } from './entities/campus.entity';
import { Dictionary } from './entities/dictionary.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { DepartmentService } from './department.service';
import { CampusService } from './campus.service';
import { DictionaryService } from './dictionary.service';
import { RoleService } from './role.service';
import { DepartmentController } from './department.controller';
import { CampusController } from './campus.controller';
import { DictionaryController } from './dictionary.controller';
import { RoleController } from './role.controller';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      Campus,
      Dictionary,
      Role,
      Permission,
      RolePermission,
    ]),
  ],
  controllers: [
    DepartmentController,
    CampusController,
    DictionaryController,
    RoleController,
  ],
  providers: [DepartmentService, CampusService, DictionaryService, RoleService],
  exports: [
    DepartmentService,
    CampusService,
    DictionaryService,
    RoleService,
    TypeOrmModule,
  ],
})
export class SystemModule {}
