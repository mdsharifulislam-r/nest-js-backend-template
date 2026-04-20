import {
  SelectQueryBuilder,
  ObjectLiteral,
  Repository,
} from 'typeorm';

class TypeOrmQueryBuilder<T extends ObjectLiteral> {
  public qb: SelectQueryBuilder<T>;
  public query: Record<string, any>;
  private alias: string;

  constructor(
    repo: Repository<T>,
    query: Record<string, any>,
    alias: string,
  ) {
    this.qb = repo.createQueryBuilder(alias);
    this.query = query;
    this.alias = alias;
  }

  // ========================
  // SEARCH
  // ========================
  search(searchableFields: string[]) {
    const searchTerm = this.query.searchTerm;

    if (searchTerm) {
      this.qb.andWhere(
        `(${searchableFields
          .map((field, i) => `${this.alias}.${field} LIKE :search${i}`)
          .join(' OR ')})`,
        searchableFields.reduce((acc, field, i) => {
          acc[`search${i}`] = `%${searchTerm}%`;
          return acc;
        }, {} as Record<string, any>),
      );
    }

    return this;
  }

  // ========================
  // FILTER
  // ========================
  filter(excludeFields: string[] = []) {
    const queryObj = { ...this.query };

    const removeFields = [
      'searchTerm',
      'sort',
      'page',
      'limit',
      'fields',
      ...excludeFields,
    ];

    removeFields.forEach((f) => delete queryObj[f]);

    Object.keys(queryObj).forEach((key) => {
      this.qb.andWhere(`${this.alias}.${key} = :${key}`, {
        [key]: queryObj[key],
      });
    });

    return this;
  }

  // ========================
  // SORT
  // ========================
  sort() {
    const sort = this.query.sort || '-createdAt';

    const order = sort.startsWith('-') ? 'DESC' : 'ASC';
    const field = sort.replace('-', '');

    this.qb.orderBy(`${this.alias}.${field}`, order);

    return this;
  }

  // ========================
  // PAGINATION
  // ========================
  paginate() {
    const limit = Number(this.query.limit) || 10;
    const page = Number(this.query.page) || 1;

    const skip = (page - 1) * limit;

    this.qb.skip(skip).take(limit);

    return this;
  }

  // ========================
  // FIELD SELECTION
  // ========================
  fields() {
    const fields = this.query.fields?.split(',') || [];

    if (fields.length) {
      this.qb.select(fields.map((f: string) => `${this.alias}.${f}`));
    }

    return this;
  }

  // ========================
  // RELATIONS
  // ========================
  populate(relations: string[] = []) {
    relations.forEach((relation) => {
      this.qb.leftJoinAndSelect(
        `${this.alias}.${relation}`,
        relation,
      );
    });

    return this;
  }

  // ========================
  // EXECUTION
  // ========================
  async getMany() {
    return this.qb.getMany();
  }

  async getOne() {
    return this.qb.getOne();
  }

  // ========================
  // PAGINATION INFO
  // ========================
  async getPaginationInfo() {
    const limit = Number(this.query.limit) || 10;
    const page = Number(this.query.page) || 1;

    const total = await this.qb.getCount();
    const totalPage = Math.ceil(total / limit);

    return {
      total,
      limit,
      page,
      totalPage,
    };
  }
}

export default TypeOrmQueryBuilder;