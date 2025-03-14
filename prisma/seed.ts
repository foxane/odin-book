import { Post, PrismaClient, User } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createUserData() {
  const result: Pick<User, 'name' | 'email' | 'bio' | 'password'>[] = [];
  for (let i = 0; i < 10; i++) {
    result.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      bio: faker.person.bio(),
      password: await hash('12', 10),
    });
  }

  return result;
}

function createPostData(usersId: number[]) {
  const result: Pick<Post, 'text' | 'userId'>[] = [];
  for (const id of usersId) {
    result.push({
      text: faker.lorem.paragraph(),
      userId: id,
    });
  }

  return result;
}

async function main() {
  const users = await prisma.user.createManyAndReturn({
    data: await createUserData(),
    select: { id: true },
  });
  console.log(users.length, ' user created');

  const usersId = users.map(el => el.id);
  const post = await prisma.post.createManyAndReturn({
    data: createPostData(usersId),
    select: { id: true },
  });
  console.log(post.length, ' post created');
}

main();
