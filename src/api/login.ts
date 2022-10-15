import { UmiApiRequest, UmiApiResponse } from "umi";
import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs";
import { signToken } from "../../utils/jwt";

export default async function (req: UmiApiRequest, res: UmiApiResponse) {
  switch (req.method) {
    case 'GET':
      const prisma = new PrismaClient();
      const user = await prisma.user.findUnique({
        where: { id:2}
      });
      console.log(user)
      // 处理完请求以后记得断开数据库链接
      await prisma.$disconnect();
      break;

    case 'POST':
      try {
        const prisma = new PrismaClient();
        const user = await prisma.user.findUnique({
          where:{ email:req.body.email }
        });

        if (!user || !bcrypt.compareSync(req.body.password, user.passwordHash)) {
          return res.status(401).json({
            message: 'Invalid email or password'
          });
        }

        console.log(user.id)
        console.log(signToken(user.id))

        res.status(200)
            .setCookie('token', await signToken(user.id))
            .json({ ...user, passwordHash: undefined });

        await prisma.$disconnect()
      } catch (error: any) {
        res.status(500).json(error);
      }
      break;
    default:
      res.status(405).json({ error: 'Method not allowed' })
  }
}
