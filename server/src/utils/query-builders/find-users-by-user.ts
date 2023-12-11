import { IQbFindUsersByUser } from '../../types/users/qb-find-users-by-user.interface';
import { SortOrder } from '../sort-order.enum';

export const qbFindUsersByUser = async ({
  repository,
  dto,
  userId,
}: IQbFindUsersByUser) => {
  const { sort, page, limit, firstName, lastName, surname, childId } = dto;
  const skip = (page - 1) * limit;

  const query = repository.createQueryBuilder('user');
  query.select([
    'user.id',
    'user.firstName',
    'user.lastName',
    'user.surname',
    'user.createdAt',
    'user.referralCode',
  ]);

  if (childId) {
    query.andWhere('user.parentId = :childId', { childId });
  } else {
    query.andWhere('user.parentId = :userId', { userId });
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
