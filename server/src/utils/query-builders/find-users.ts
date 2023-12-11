import { IQbFindUsers } from '../../types/users/qb-find-users.interface';
import { SortOrder } from '../sort-order.enum';

export const qbFindUsers = async ({
  repository,
  dto,
  isSuperAdmin,
}: IQbFindUsers) => {
  const {
    sort,
    page,
    limit,
    firstName,
    lastName,
    surname,
    childId,
    email,
    userId,
  } = dto;
  const skip = (page - 1) * limit;

  const query = repository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .leftJoinAndSelect('user.status', 'status');

  query.addSelect([
    'user.firstName',
    'user.lastName',
    'user.surname',
    'user.createdAt',
    'user.updatedAt',
    'user.deletedAt',
  ]);

  if (isSuperAdmin) {
    query.addSelect([
      'user.id',
      'user.phone',
      'user.email',
      'user.referralCode',
    ]);
  }

  if (userId) {
    query.andWhere('user.id = :userId', { userId });
  }

  if (email) {
    query.andWhere('user.email ILIKE :email', { email: '%' + email + '%' });
  }

  if (childId) {
    query.andWhere('user.parentId = :childId', { childId });
  }

  if (firstName) {
    query.andWhere('user.firstName ILIKE :firstName', {
      firstName: '%' + firstName + '%',
    });
  }

  if (lastName) {
    query.andWhere('user.lastName ILIKE :lastName', {
      lastName: '%' + lastName + '%',
    });
  }

  if (surname) {
    query.andWhere('user.surname ILIKE :surname', {
      surname: '%' + surname + '%',
    });
  }

  // if (search) {
  //   query.andWhere(
  //     new Brackets((qb) => {
  //       qb.where('user.email ILIKE :email', {
  //         email: '%' + search + '%',
  //       })
  //         .orWhere('user.firstName ILIKE :firstName', {
  //           firstName: '%' + search + '%',
  //         })
  //         .orWhere('user.lastName ILIKE :lastName', {
  //           lastName: '%' + search + '%',
  //         });
  //     }),
  //   );
  // }

  if (sort) {
    sort.forEach((sortBy) =>
      query.addOrderBy(
        `user.${sortBy[0]}`,
        sortBy[1].toUpperCase() as SortOrder,
      ),
    );
  } else {
    query.orderBy('user.lastName', SortOrder.ASC);
  }

  const [entities, itemCount] = await query
    .offset(skip)
    .limit(limit)
    .getManyAndCount();

  return { entities, limit, page, itemCount };
};
